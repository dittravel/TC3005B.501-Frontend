/**
* Import Data Form Component
* 
* This component provides a form for administrators to upload an organizational structure XML file.
*/

import ImportDataButton from "@/components/Buttons/ImportDataButton";

// Example JSON structure
const exampleJson = 
`{
  "Sociedad": {
    "Nombre": "Ditta Servicios",
    "CeCo": [
      { "Clave": 101, "Descripcion": "Finanzas" }
    ],
    "Departamentos": [
      { "Clave": 1, "Descripcion": "Finanzas", "CeCo": 101 }
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
      }
    ]
  }
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
        <pre className="card-secondary overflow-x-scroll">
          {exampleJson}
        </pre>
      </div>
    </div>
  );
}