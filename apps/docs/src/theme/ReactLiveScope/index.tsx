import React from 'react';
import { OpenGrid } from '@opengrid/react';
import type { ColumnDef } from '@opengrid/core';
// Grid styling (structural CSS + light theme variables) for the live preview.
import '@opengrid/themes/dist/opengrid-light.css';

interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  salary: number;
  active: boolean;
}

const employees: Employee[] = [
  { id: 1, name: 'Alice Smith', department: 'Engineering', role: 'Senior', salary: 145000, active: true },
  { id: 2, name: 'Bob Johnson', department: 'Marketing', role: 'Manager', salary: 110000, active: true },
  { id: 3, name: 'Charlie Diaz', department: 'Engineering', role: 'Lead', salary: 160000, active: false },
  { id: 4, name: 'Diana Prince', department: 'Sales', role: 'Mid', salary: 92000, active: true },
  { id: 5, name: 'Evan Wright', department: 'Finance', role: 'Senior', salary: 130000, active: true },
  { id: 6, name: 'Fatima Noor', department: 'Engineering', role: 'Junior', salary: 78000, active: true },
  { id: 7, name: 'Grace Lee', department: 'Marketing', role: 'Mid', salary: 88000, active: false },
  { id: 8, name: 'Hiro Tanaka', department: 'Sales', role: 'Manager', salary: 121000, active: true },
];

const columns: ColumnDef<Employee>[] = [
  { field: 'id', headerName: 'ID', width: 60, sortable: true, pinned: 'left' },
  { field: 'name', headerName: 'Name', width: 160, sortable: true, filterable: true, pinned: 'left' },
  { field: 'department', headerName: 'Department', width: 140, sortable: true, filterable: true, groupable: true },
  { field: 'role', headerName: 'Role', width: 110, sortable: true, filterable: true },
  {
    field: 'salary',
    headerName: 'Salary',
    width: 120,
    sortable: true,
    aggFunc: 'avg',
    valueFormatter: ({ value }) =>
      typeof value === 'number' ? `$${value.toLocaleString()}` : '',
  },
  {
    field: 'active',
    headerName: 'Active',
    width: 90,
    valueFormatter: ({ value }) => (value ? '✓' : '✗'),
  },
];

// Everything returned here is in scope inside ```jsx live code blocks.
const ReactLiveScope: Record<string, unknown> = {
  React,
  ...React,
  OpenGrid,
  employees,
  columns,
};

export default ReactLiveScope;
