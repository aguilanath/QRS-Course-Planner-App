"use client";
import React, { useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "../problem_1.css";
import SubmitButton from "@/app/components/app/submit/SubmitButton";

ModuleRegistry.registerModules([AllCommunityModule]);

const AppForm = () => {

  const grid_height_vh = 40;

  const companyGridRef = useRef();
  const supplierGridRef = useRef();
  const supplierSizeRef = useRef();

  const [companyGrid, setCompanyGrid] = useState([
    { "suppliers": 0, "stock_need": 0, "units": 0 }
  ]);

  const [supplierGrid, setSupplierGrid] = useState([]);
  const [outputGrid, setOutputGrid] = useState([]);
  const [companyGridColumns, setCompanyGridColumns] = useState([
    { "headerName": '# Suppliers', "field": 'suppliers', "editable": true },
    { "headerName": 'Stock need in (days)', "field": 'stock_need', "editable": true },
    { "headerName": 'Units of Product', "field": 'units', "editable": true },
  ]);
  const [supplierGridColumns, setSupplierGridColumns] = useState([
    { "headerName": 'Supplier', "field": 'supplier' },
    { "headerName": 'Bulk Units', "field": 'bulk_units', "editable": true },
    { "headerName": 'Total Cost', "field": 'total_cost', "editable": true },
    { "headerName": 'Lead Time', "field": 'lead_time', "editable": true },
  ]);
  const [outputGridColumns, setOutputGridColumns] = useState([
    { "field": "supplier", "headerName": "Supplier Constraints" },
    {
      "headerName": "Order Selected",
      "children": [
        { "field": "order_1", "headerName": " " },
        { "field": "order_2", "headerName": " " },
        { "field": "order_3", "headerName": " " },
      ],
    }
  ]);

  const handleCompanyGridChanged = (params) => {
    const supplierCount = params['data'][companyGridColumns[0]['field']];
    if (supplierCount != null && supplierCount > -1) {
      if (supplierGrid.length < supplierCount) {
        const newSupplierGrid = Array.from(supplierGrid).concat(Array.from({ length: (supplierCount - supplierGrid.length) }, (_, index) => ({
          supplier: `${supplierGridColumns[0]['headerName']} ${index + 1 + supplierGrid.length}`,
          bulk_units: 0,
          total_cost: 0,
          lead_time: 0,
        })));
        setSupplierGrid(newSupplierGrid);
      } else if (supplierGrid.length > supplierCount) {
        const newSupplierGrid = Array.from(supplierGrid).slice(0, supplierCount);
        setSupplierGrid(newSupplierGrid);
      }
    }
  };

  const sizeStrategy = {
    type: "fitGridWidth",
    defaultMinWidth: 100
  };

  const displayOutput = (data) => {
    const res = Array.from({ length: supplierSizeRef.size }, () => Array(supplierSizeRef.o).fill(0));
    for (let o = 0; o < supplierSizeRef.o; o++) {
        for (let s = 0; s < supplierSizeRef.size; s++) {
            const key = `${s}_${o}`;
            res[s][o] = data[key] ?? 0;
        }
    }
    const output = Array.from({ length: supplierSizeRef.size }, (_, i) => ({
        supplier: supplierSizeRef.idx[i],
        order_1: res[i][0] ?? 0,
        order_2: res[i][1] ?? 0,
        order_3: res[i][2] ?? 0,
    }));
    setOutputGrid(output)
  };

  const getData = (companyGridRef, supplierGridRef) => {
    setOutputGrid([]);
    companyGridRef.current.api.forEachNode((node) => node.setSelected(false));
    supplierGridRef.current.api.forEachNode((node) => node.setSelected(false));
    const rowDataCompany = [];
    const rowDataSupplier = [];
    companyGridRef.current.api.forEachNode((node) => rowDataCompany.push(node.data));
    supplierGridRef.current.api.forEachNode((node) => rowDataSupplier.push(node.data));
    supplierSizeRef.size = rowDataCompany[0]["suppliers"]
    const D = rowDataCompany[0]["stock_need"]
    supplierSizeRef.idx = rowDataSupplier.map(s => s["supplier"])
    const leadTimes = rowDataSupplier.map(s => s.lead_time);
    let o_temp = 0;
    const minLeadTime = Math.min(...leadTimes);
    if (minLeadTime !== 0) {
      o_temp = Math.floor(D / minLeadTime);
    }
    supplierSizeRef.o = o_temp
    return {"companyData": rowDataCompany, "supplierData": rowDataSupplier}
  };

  const gridOptions = {
    stopEditingWhenCellsLoseFocus: true,
  };

  return (
    <div>
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Company Information</h2>
          <div style={{ margin: "0 auto", height: `10.55vh`, width: "50%" }}>
            <AgGridReact
              rowData={companyGrid}
              columnDefs={companyGridColumns}
              autoSizeStrategy={sizeStrategy}
              onCellValueChanged={handleCompanyGridChanged}
              ref={companyGridRef}
              gridOptions={gridOptions}
            />
          </div>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Suppliers</h2>
          <div style={{ margin: "0 auto", height: `${grid_height_vh}vh`, width: "50%" }}>
            <AgGridReact
              rowData={supplierGrid}
              columnDefs={supplierGridColumns}
              autoSizeStrategy={sizeStrategy}
              ref={supplierGridRef}
              gridOptions={gridOptions}
            />
          </div>
        </div>
        <div>
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Solution</h2>
          <div style={{ margin: "0 auto", height: `${grid_height_vh}vh`, width: "50%" }}>
            <AgGridReact
              rowData={outputGrid}
              columnDefs={outputGridColumns}
              autoSizeStrategy={sizeStrategy}
              gridOptions={gridOptions}
            />
          </div>
        </div>
        <SubmitButton problem_id="example_problem" getData={() => getData(companyGridRef, supplierGridRef)} sendData={displayOutput} />
        </div>
    </div>
  );
};

export default AppForm;