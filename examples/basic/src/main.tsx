import React from 'react';
import ReactDOM from 'react-dom/client';
import { OpenGrid } from '@opengrid/react';
import type { ColumnDef } from '@opengrid/core';

interface Person {
  name: string;
  age: number;
  city: string;
}

const columns: ColumnDef<Person>[] = [
  { field: 'name', headerName: 'Name', width: 200, sortable: true, filterable: true },
  { field: 'age', headerName: 'Age', width: 100, sortable: true },
  { field: 'city', headerName: 'City', width: 200, sortable: true, filterable: true },
];

const data: Person[] = [
  { name: 'Alice', age: 30, city: 'London' },
  { name: 'Bob', age: 25, city: 'Paris' },
  { name: 'Charlie', age: 35, city: 'Berlin' },
  { name: 'Diana', age: 28, city: 'London' },
  { name: 'Eve', age: 32, city: 'Paris' },
];

function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>OpenGrid — Basic Example</h1>
      <OpenGrid<Person>
        columnDefs={columns}
        rowData={data}
        rowHeight={40}
        height={300}
        selection="multiple"
        showFilterRow
      />
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
