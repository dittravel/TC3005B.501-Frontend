/**
* Button to import users from an XML file
* 
* This button is used in the AdminView to allow administrators to import users 
* from an XML file. When clicked, it triggers a hidden file input that accepts XML files
*/

import Button from "@/components/Buttons/Button";

interface Props {
  endpoint: string; // API endpoint to send the XML file for processing
  token: string;
}

export default function ImportUsersButton({ endpoint, token }: Props) {

  // Handle file input
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Send the file to the backend
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert("Archivo importado exitosamente");
      } else {
        alert(`Error al importar archivo: ${data.error || "Desconocido"}`);
      }
    } catch (error) {
      alert(`Error al importar archivo: ${error instanceof Error ? error.message : "Desconocido"}`);
    }
  };

  return (
    <div>
      <Button
        variant="link"
        color="secondary"
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
            <path d="M7.25 10.25a.75.75 0 0 0 1.5 0V4.56l2.22 2.22a.75.75 0 1 0 1.06-1.06l-3.5-3.5a.75.75 0 0 0-1.06 0l-3.5 3.5a.75.75 0 0 0 1.06 1.06l2.22-2.22v5.69Z" />
            <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
          </svg>
          Importar Datos
        </div>
      </Button>
      <input
        type="file"
        id="fileInput"
        accept=".xml"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}