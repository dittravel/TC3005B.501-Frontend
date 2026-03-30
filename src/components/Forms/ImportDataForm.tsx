/**
* Import Data Form Component
* 
* This component provides a form for administrators to upload an organizational structure XML file.
*/

import ImportDataButton from "@/components/Buttons/ImportDataButton";

// Example XML structure to show in the UI as a reference
const exampleXml = 
`<Organizacion name="Mi Empresa">
  <Departamento name="Finanzas" cost_center="CC-FN-01">
    <Empleado usuario="laura.flores" rol="Autorizador" />
    <Empleado usuario="andres.gomez" rol="Solicitante" jefe_usuario="laura.flores" />
  </Departamento>
  <Departamento name="Recursos Humanos" cost_center="CC-RH-01">
    <Empleado usuario="miguel.de.cervantes" rol="Autorizador" />
  </Departamento>
</Organizacion>`;

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
          <p>Carga un archivo XML con la estructura organizacional de tu empresa</p>
        </div>
        <ImportDataButton
          endpoint={endpoint}
          token={token}
        />
      </div>
      <div className="card">
        <div className="card-title">
          <h2>Formato esperado</h2>
          <p>El archivo XML debe seguir la siguiente estructura</p>
        </div>
        <pre className="card-secondary whitespace-pre-wrap break-words overflow-x-auto">
          {exampleXml}
        </pre>
      </div>
    </div>
  );
}