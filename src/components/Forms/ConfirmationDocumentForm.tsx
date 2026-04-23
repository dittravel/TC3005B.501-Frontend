import { useEffect, useMemo, useRef, useState } from "react";
import type { TravelRoute } from "@/types/TravelRoute";
import Toast from "@/components/Utils/Toast";
import Button from "@/components/Buttons/Button";
import Input from "@/components/Utils/Input";
import ModalWrapper from "../Modals/ModalWrapper";

interface Props {
    token: string;
    route: TravelRoute;
    routeIndex: number;
}


export default function ExpensesForm({
    token,
    route,
    routeIndex,
}: Props) {
    const [formData, setFormData] = useState({
        routeId: routeIndex
    });

    // File states
    const [flightPdfFile, setFlightPdfFile] = useState<File | null>(null);
    const [hotelPdfFile, setHotelPdfFile] = useState<File | null>(null);

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Clear success/error toast after 4 seconds
    // useEffect(() => {
    //     if (toast) {
    //         const timer = setTimeout(() => {
    //             setToast(null);
    //         }, 4000);
    //         return () => clearTimeout(timer);
    //     }
    // }, [toast]);

    // Handle form field changes
    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle form submission for creating or updating receipt
    const handleSubmit = async () => {
        if (flightPdfFile && !flightPdfFile.name.toLowerCase().endsWith('.pdf')) {
            setToast({ message: "El archivo PDF debe tener extensión .pdf válida.", type: 'error' });
            setLoading(false);
            return;
        }

        const baseUrl = import.meta.env.PUBLIC_API_BASE_URL;
        const submitData = new FormData();
        submitData.append("route_id", formData.routeId.toString());

        if (flightPdfFile) submitData.append("flightPdf", flightPdfFile);
        if (hotelPdfFile) submitData.append("hotelPdf", hotelPdfFile);

        console.log("Submitting form with data:");
        for (const pair of submitData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        const response = await fetch(`${baseUrl}/travel-agent/create-reservation-file`, {
          method: "POST",
          body: submitData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include"
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Error: ${response.status}`);
        }

        // try {
        //     setLoading(true);
        //     setToast(null);

        //     // Validation checks
        //     if (!formData.routeId) {
        //         setToast({ message: "Por favor, selecciona un destino válido.", type: 'error' });
        //         setLoading(false);
        //         return;
        //     }

        //     if (pdfFile && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
        //         setToast({ message: "El archivo PDF debe tener extensión .pdf válida.", type: 'error' });
        //         setLoading(false);
        //         return;
        //     }

        //     // if (mode === "create") {
        //     // Create expense with files
        //     //const baseUrl = import.meta.env.PUBLIC_API_BASE_URL;
        //     const submitData = new FormData();
        //     submitData.append("route_id", formData.routeId.toString());

        //     if (pdfFile) submitData.append("pdf", pdfFile);

        //     const response = await fetch(`${baseUrl}/applicant/create-expense-with-files`, {
        //         method: "POST",
        //         body: submitData,
        //         headers: {
        //             Authorization: `Bearer ${token}`,
        //         },
        //         credentials: "include"
        //     });

        //     if (!response.ok) {
        //         const error = await response.json();
        //         throw new Error(error.error || `Error: ${response.status}`);
        //     }

        //     setToast({
        //         message: `Confirmación subida exitosamente.`,
        //         type: 'success'
        //     });
        //     await new Promise(resolve => setTimeout(resolve, 2000));
        //     window.location.href = redirectTo;
        // } catch (err) {
        //     setToast({ message: err instanceof Error ? err.message : "Ocurrió un error al subir la confirmación.", type: 'error' });
        //     setLoading(false);
        // }
    };

    return (
        <>
            <div className="space-y-6">
                {route.plane_needed && (
                    <div className="space-y-4">
                        <Input
                            name="flightPdfFile"
                            label="Reservación Vuelo PDF"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFlightPdfFile(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                )}
                {route.hotel_needed && (
                    <div className="space-y-4">
                        <Input
                            name="hotelPdfFile"
                            label="Reservación Hotel PDF"
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setHotelPdfFile(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                    <div>
                        <ModalWrapper
                            title="Subir Comprobante"
                            message="¿Estas seguro de que deseas realizar esta acción?"
                            modal_type="confirm"
                            color="success"
                            variant="filled"
                            onConfirm={handleSubmit}
                            disabled={loading}
                        >
                            Subir documento reservación
                        </ModalWrapper>
                    </div>
                </div>
            </div>
        </>
    );
}