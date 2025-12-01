export const naturalSort = (aSerial: string | undefined, bSerial: string | undefined, aName: string, bName: string) => {
  const sA = aSerial || '';
  const sB = bSerial || '';

  if (sA && !sB) return -1;
  if (!sA && sB) return 1;
  if (!sA && !sB) return aName.localeCompare(bName);

  const re = /(\d+)/g;
  const sA_parts = sA.toString().split(re);
  const sB_parts = sB.toString().split(re);

  for (let i = 0; i < Math.min(sA_parts.length, sB_parts.length); i++) {
      let partA: string | number = sA_parts[i];
      let partB: string | number = sB_parts[i];

      if (i % 2 === 1) { // It's a number part
          partA = parseInt(partA, 10);
          partB = parseInt(partB, 10);
      }

      if (partA !== partB) {
          return partA < partB ? -1 : 1;
      }
  }
  return sA_parts.length - sB_parts.length;
};

export const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const formatDate = (date: any): string => {
  if (!date) return 'N/A';
  if (date.toDate) return date.toDate().toLocaleString();
  return new Date(date).toLocaleString();
};