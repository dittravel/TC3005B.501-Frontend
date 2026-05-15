/**
* Import Data Form Component
* 
* This component provides a form for administrators to upload an organizational structure XML file.
*/

import { useState } from "react";
import ImportDataButton from "@/components/Buttons/ImportDataButton";
import Icon from "@/components/Utils/Icon";
import Button from "../Buttons/Button";

// Example JSON structure
const exampleJson =
`{
  "CeCo": [
    { "Clave": 101, "Descripcion": "CC-101" },
    { "Clave": 102, "Descripcion": "CC-102" }
  ],
  "Departamentos": [
    { "Clave": 1, "Descripcion": "Finanzas", "CeCo": 101 },
    { "Clave": 2, "Descripcion": "Operaciones", "CeCo": 102 }
  ],
  "Empleados": [
    {
      "NoEmpleado": "Emp001",
      "Nombre": "Admin User",
      "Usuario": "admin",
      "Email": "admin@empresa.com",
      "JefeInmediato": null,
      "Proveedor": 2001,
      "CeCo": 101,
      "Departamento": 1,
      "Status": "A",
      "FechaAlta": "2023-01-01",
      "FechaCambio": "2023-06-01"
    },
    {
      "NoEmpleado": "Emp002",
      "Nombre": "Carlos Ramos",
      "Usuario": "carlos.ramos",
      "Email": "carlos.ramos@empresa.com",
      "JefeInmediato": "Emp001",
      "Proveedor": 2002,
      "CeCo": 101,
      "Departamento": 1,
      "Status": "A",
      "FechaAlta": "2023-01-05",
      "FechaCambio": "2023-06-01"
    },
    {
      "NoEmpleado": "Emp003",
      "Nombre": "Paula Martínez",
      "Usuario": "paula.martinez",
      "Email": "paula.martinez@empresa.com",
      "JefeInmediato": "Emp002",
      "Proveedor": 2003,
      "CeCo": 101,
      "Departamento": 1,
      "Status": "A",
      "FechaAlta": "2023-01-10",
      "FechaCambio": "2023-06-01"
    }
  ]
}`;

type Props = {
  endpoint: string;
  token: string;
};

/**
 * ImportDataForm Component
 * Allows administrators to upload an XML file containing the organizational structure of the company.
 * @param {endpoint} - The API endpoint to which the XML file will be sent for processing.
 * @param {token} - The authentication token to authorize the API request.
 */
export default function ImportDataForm({ endpoint, token }: Props) {
  const [openExample, setOpenExample] = useState(false);

  // Download example JSON file
  const downloadExample = () => {
    // A blob (binary large object) is used to 
    // create a downloadable file from the example JSON string.
    // Ref: https://developer.mozilla.org/es/docs/Web/API/Blob
    const blob = new Blob([exampleJson], { type: 'application/json' });

    // url is created for the blob
    const url = URL.createObjectURL(blob);

    // A temporary link element is created to trigger the download of the file when clicked.
    const link = document.createElement('a');

    link.href = url;
    link.download = 'organigrama.json';
    document.body.appendChild(link);

    // Click the link to start the donwload
    link.click();

    // Clean up the URL and remove the temporary link element after the download is triggered.
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="card">
        <div className="card-title">
          <h2>Subir archivo</h2>
          <p>Carga un archivo JSON con la estructura organizacional de tu empresa</p>
        </div>
        <ImportDataButton
          endpoint={endpoint}
          token={token}
        />
      </div>
      <div className="card">
        <div className="card-title">
          <h2>Formato esperado</h2>
          <p>El archivo JSON debe seguir la siguiente estructura</p>
        </div>
        <button
          className="flex w-full p-2 bg-secondary hover:opacity-80 hover:cursor-pointer rounded-md justify-center"
          onClick={() => setOpenExample(!openExample)}
        >
          <div className="flex gap-2 items-center justify-center">
            <p className="text-white font-medium">Ver ejemplo de formato</p>
            <Icon name={openExample ? 'expand_less' : 'expand_more'} className="text-white" />
          </div>
        </button>
        {openExample && (
          <div className="relative">
            <Button
              variant="filled"
              color="secondary"
              size="small"
              onClick={downloadExample}
              className="absolute top-4 right-4 z-10"
            >
              Descargar ejemplo
            </Button>
            <pre className="card-secondary overflow-x-scroll">
              {exampleJson}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}