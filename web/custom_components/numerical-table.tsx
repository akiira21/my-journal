import React from "react";

interface NumericalTableProps {
  data?: (number | string)[][];
  headers?: string[];
}

const NumericalTable: React.FC<NumericalTableProps> = ({ data, headers }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-red-500">Error: No data provided for the table.</p>
    );
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-md">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        {headers && headers.length > 0 && (
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {headers.map((header, index) => (
                <th key={index} scope="col" className="px-6 py-3 font-mono">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`
                ${
                  rowIndex % 2 === 0
                    ? "bg-white dark:bg-zinc-800"
                    : "bg-gray-50 dark:bg-zinc-700"
                }
                hover:bg-gray-200 dark:hover:bg-gray-600
              `}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 font-mono whitespace-nowrap"
                >
                  {typeof cell === "number" ? cell.toFixed(4) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NumericalTable;
