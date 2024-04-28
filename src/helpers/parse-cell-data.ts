export const parseCellData = (cellData: string) => {
  if (cellData === 'null') {
    return '0.00%';
  }

  const parsedCellArray = cellData.split(';');
  const parsedCell = parsedCellArray[0].slice(0, 4) + '%';

  return parsedCell;
};
