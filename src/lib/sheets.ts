export interface SheetData {
  range: string;
  majorDimension: string;
  values: string[][];
}

export const fetchSheetData = async (spreadsheetId: string, range: string, accessToken: string): Promise<string[][]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch sheet data');
  }

  const data: SheetData = await response.json();
  return data.values || [];
};

export const parseSheetToScreens = (values: string[][]) => {
  if (values.length < 2) return [];
  
  const headers = values[0].map(h => h.toLowerCase().trim());
  const rows = values.slice(1);

  return rows.map((row, index) => {
    const obj: any = { id: index + 1 };
    headers.forEach((header, i) => {
      if (row[i] !== undefined) {
        // Handle numeric fields
        if (['id', 'overlayopacity', 'overlayblur'].includes(header)) {
          obj[header] = Number(row[i]);
        } else {
          // Map header names to ScreenData fields if they differ
          let key = header;
          if (header === 'bgtype') key = 'bgType';
          if (header === 'bgurl') key = 'bgUrl';
          if (header === 'ctatext') key = 'ctaText';
          if (header === 'ctaurl') key = 'ctaUrl';
          if (header === 'tintcolor') key = 'tintColor';
          
          obj[key] = row[i];
        }
      }
    });
    return obj;
  });
};

export const updateSheetData = async (spreadsheetId: string, range: string, values: any[][], accessToken: string) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update sheet data');
  }

  return response.json();
};

export const prepareScreensForSheet = (screens: any[]) => {
  const headers = ['id', 'title', 'subtitle', 'description', 'bgType', 'bgUrl', 'ctaText', 'ctaUrl', 'tintColor', 'overlayOpacity', 'overlayBlur'];
  const values = [headers];

  screens.forEach(s => {
    values.push(headers.map(h => s[h] !== undefined ? String(s[h]) : ''));
  });

  return values;
};
