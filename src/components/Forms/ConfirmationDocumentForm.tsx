import { useEffect, useState } from "react";
import type { TravelRoute } from "@/types/TravelRoute";
import Toast from "@/components/Utils/Toast";
import Input from "@/components/Utils/Input";
import ModalWrapper from "../Modals/ModalWrapper";

interface Props {
    token: string;
    route: TravelRoute;
    routeId: number;
}

export default function ConfirmationDocumentForm({
    token,
    route,
    routeId,
}: Readonly<Props>) {
    const [flightPdfFile, setFlightPdfFile] = useState<File | null>(null);
    const [hotelPdfFile, setHotelPdfFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Clear toast after 4 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setToast(null);

            if (flightPdfFile && !flightPdfFile.name.toLowerCase().endsWith('.pdf')) {
                setToast({ message: "El archivo de vuelo debe tener extensión .pdf válida.", type: 'error' });
                setLoading(false);
                return;
            }

            if (hotelPdfFile && !hotelPdfFile.name.toLowerCase().endsWith('.pdf')) {
                setToast({ message: "El archivo de hotel debe tener extensión .pdf válida.", type: 'error' });
                setLoading(false);
                return;
            }

            const baseUrl = import.meta.env.PUBLIC_API_BASE_URL;
            const submitData = new FormData();
            submitData.append("route_id", routeId.toString());

            if (flightPdfFile) submitData.append("flightPdf", flightPdfFile);
            if (hotelPdfFile) submitData.append("hotelPdf", hotelPdfFile);

            const response = await fetch(`${baseUrl}/travel-agent/create-reservation-file`, {
                method: "POST",
                body: submitData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Error: ${response.status}`);
            }

            setToast({ message: "Documentos de reservación subidos exitosamente.", type: 'success' });
        } catch (err) {
            setToast({ message: err instanceof Error ? err.message : "Ocurrió un error al subir los documentos.", type: 'error' });
            setLoading(false);
        }
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
                            color="secondary"
                            variant="filled"
                            onConfirm={handleSubmit}
                            disabled={loading}
                        >
                            Subir documento reservación
                        </ModalWrapper>
                    </div>
                </div>
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} />
            )}
        </>
    );
}