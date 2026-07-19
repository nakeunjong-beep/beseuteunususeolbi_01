// Google Workspace API helpers with full UTF-8 and Base64 url-safe support

export interface SubmissionData {
  id?: string;
  name: string;
  phone: string;
  service: string;
  urgency: string;
  notes: string;
  timestamp: string;
  syncedToSheets?: boolean;
  emailSent?: boolean;
}

// Robust UTF-8 safe Base64 encoding
function utf8ToBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

// Convert normal Base64 to url-safe Base64url
function base64ToUrlSafe(base64: string): string {
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Creates a new Google Sheet for storing submissions
 */
export async function createGoogleSheet(accessToken: string, title: string = '10초 초고속 상담 예약 접수현황'): Promise<{ spreadsheetId: string; sheetName: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: '예약접수목록',
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || '구글 시트 생성에 실패했습니다.');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const sheetName = data.sheets?.[0]?.properties?.title || '예약접수목록';

  // Seed the headers
  await appendRowToGoogleSheet(accessToken, spreadsheetId, sheetName, [
    '신청 시간',
    '고객 성함',
    '연락 받으실 번호',
    '신청 서비스',
    '긴급 정도',
    '추가 요청사항',
  ]);

  return { spreadsheetId, sheetName };
}

/**
 * Appends a row of data to the Google Sheet
 */
export async function appendRowToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rowValues: string[]
): Promise<any> {
  const range = `${encodeURIComponent(sheetName)}!A:F`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || '구글 시트 데이터 전송에 실패했습니다.');
  }

  return await response.json();
}

/**
 * Sends an email notification to the owner's personal Gmail
 */
export async function sendGmailNotification(
  accessToken: string,
  toEmail: string,
  submission: SubmissionData
): Promise<any> {
  const subject = `[신속설비] 새 상담 예약이 접수되었습니다 - ${submission.name}님`;
  
  const bodyText = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="color: #2e7d32; border-bottom: 2px solid #a5d6a7; padding-bottom: 12px; margin-top: 0;">📞 10초 초고속 상담 예약 접수</h2>
      <p style="font-size: 14px; color: #666;">고객님께서 사이트에서 신속 상담 예약을 남기셨습니다. 아래의 정보를 확인하시어 즉시 연락 바랍니다.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: left; width: 120px;">신청 시간</th>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${submission.timestamp}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: left;">고객 성함</th>
          <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">${submission.name}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: left;">연락처</th>
          <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; color: #1b5e20;">${submission.phone}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: left;">신청 서비스</th>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${submission.service}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: left;">긴급 정도</th>
          <td style="padding: 10px; border: 1px solid #e0e0e0; color: #d32f2f; font-weight: bold;">${submission.urgency}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: left;">요청사항</th>
          <td style="padding: 10px; border: 1px solid #e0e0e0; white-space: pre-wrap;">${submission.notes || '없음'}</td>
        </tr>
      </table>
      
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999;">
        본 메일은 구글 계정 연동을 통해 [신속설비] 플랫폼에서 자동 발송되었습니다.
      </div>
    </div>
  `;

  // Construct standard MIME
  const subjectB64 = utf8ToBase64(subject);
  const bodyB64 = utf8ToBase64(bodyText);

  const mimeMessage = [
    `To: ${toEmail}`,
    `Subject: =?utf-8?B?${subjectB64}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    bodyB64,
  ].join('\r\n');

  const raw = base64ToUrlSafe(utf8ToBase64(mimeMessage));

  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || '이메일 전송에 실패했습니다.');
  }

  return await response.json();
}
