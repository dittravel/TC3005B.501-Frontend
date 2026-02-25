/**
 * TravelRequestForm Component
 * 
 * Comprehensive travel request form that supports creating, editing, and saving draft requests.
 * Manages multiple routes with detailed validation for dates, times, and required fields.
 * Includes automatic save to draft functionality and role-based navigation.
 */

import { useState, useEffect } from 'react';
import { apiRequest } from '@utils/apiClient';
import type { TravelRoute } from '@/types/TravelRoute';
import type { FormData } from '@/types/FormData';
import type { DepartmentData } from '@/types/DepartmentData';
import RouteInputGroup from '@/components/RouteInputGroup';
import Toast from '@/components/Toast';

interface Props {
  data?: FormData;
  mode: 'create' | 'edit' | 'draft';
  requestId?: string;
  userId: string;
  role?: string;
  token: string;
}

const emptyRoute: TravelRoute = {
  routeIndex: 0,
  originCountryName: '',
  originCityName: '',
  destinationCountryName: '',
  destinationCityName: '',
  beginningDate: '',
  beginningTime: '',
  endingDate: '',
  endingTime: '',
  planeNeeded: false,
  hotelNeeded: false
};

const initialFormState: FormData = {
  ...emptyRoute,
  notes: '',
  requestedFee: '',
  imposedFee: 0,
  routes: [{ ...emptyRoute, routeIndex: 0 }],
};

export default function TravelRequestForm({ data, mode, requestId, userId, role, token }: Props) {
  const [deptData, setDeptData] = useState<DepartmentData | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [disabledButton, setDisabledButton] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const inputStyle = 'border border-gray-300 p-2 rounded w-full bg-white';

  /**
   * Transforms and loads initial form data when component receives data prop.
   */
  useEffect(() => {
    if (data) {
      const transformedRoutes = data.routes.map(route => ({
        ...route,
        originCountryName: route.originCountryName,
        originCityName: route.originCityName,
        destinationCountryName: route.destinationCountryName,
        destinationCityName: route.destinationCityName,
      }));
      const newData = {
        ...data,
        routes: transformedRoutes,
      };
      setFormData(newData);
    }
  }, [data]);

  /**
   * Fetches department information for the current user.
   */
  useEffect(() => {
    async function fetchDepartmentInfo() {
      try {
        const response = await apiRequest(`/applicant/get-cc/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDeptData(response);
      } catch (err) {
        // TODO: Implement proper error handling for department fetch failures
      }
    }
    fetchDepartmentInfo();
  }, [userId, token]);

  /**
   * Handles updates to individual route fields.
   * @param {number} index - The route index to update
   * @param {string} name - The field name to update
   * @param {any} value - The new value for the field
   * @returns {void}
   */
  const handleRouteUpdate = (index: number, name: string, value: any) => {
    setError(null);
    setFormData((prev) => {
      const updatedRoutes = prev.routes.map((route, i) => {
        if (i === index) {
          return {
            ...route,
            [name]: value
          };
        }
        return route;
      });
      return { ...prev, routes: updatedRoutes };
    });
  };

  /**
   * Handles changes to general form fields (notes, requested fee, etc.).
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event
   * @returns {void}
   */
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError(null);
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Adds a new empty route to the form.
   * @returns {void}
   */
  const addRoute = () => {
    setFormData((prev) => ({
      ...prev,
      routes: [...prev.routes, { ...emptyRoute, routeIndex: prev.routes.length }]
    }));
  };

  /**
   * Removes a route at the specified index and reindexes remaining routes.
   * @param {number} indexToRemove - The route index to remove
   * @returns {void}
   */
  const removeRoute = (indexToRemove: number) => {
    setFormData((prev) => {
      const filteredRoutes = prev.routes.filter((_, i) => i !== indexToRemove);
      const reindexedRoutes = filteredRoutes.map((route, i) => ({
        ...route,
        routeIndex: i,
      }));
      return { ...prev, routes: reindexedRoutes };
    });
  };

  /**
   * Validates all routes for date/time constraints and required fields.
   * Checks that:
   * - Dates are not empty and formatted correctly
   * - Beginning date is not in the past
   * - Ending date is not before beginning date
   * - If same day, ending time must be after beginning time
   * @returns {string | null} Error message if validation fails, null if successful
   */
  const validateRoutes = (): string | null => {
    const today = new Date();
    // Set today to the start of the day (00:00:00) for accurate date-only comparison
    today.setHours(0, 0, 0, 0); 

    for (const [idx, route] of formData.routes.entries()) {
      // Validate that date strings are not empty before creating Date objects
      if (!route.beginningDate || !route.endingDate) {
        return `Ruta #${idx + 1}: Las fechas de inicio y fin son obligatorias.`;
      }

      const beginningDate = new Date(route.beginningDate);
      const endingDate = new Date(route.endingDate);

      // Check if Date objects are valid (e.g., handles malformed date strings if not caught by input type="date")
      if (isNaN(beginningDate.getTime()) || isNaN(endingDate.getTime())) {
        return `Ruta #${idx + 1}: Formato de fecha inválido. Por favor, utiliza el formato MM/DD/YYYY.`;
      }

      // 1. Check if beginningDate is in the past
      // Compare normalized dates to ignore time component
      const beginningDateOnly = new Date(beginningDate.getFullYear(), beginningDate.getMonth(), beginningDate.getDate());
      if (beginningDateOnly < today) {
        return `Ruta #${idx + 1}: La fecha de inicio (${route.beginningDate}) no puede ser una fecha pasada.`;
      }

      // 2. Check if endingDate is before beginningDate
      // Compare normalized dates for initial check
      const endingDateOnly = new Date(endingDate.getFullYear(), endingDate.getMonth(), endingDate.getDate());
      if (endingDateOnly < beginningDateOnly) {
        return `Ruta #${idx + 1}: La fecha de fin (${route.endingDate}) debe ser igual o posterior a la fecha de inicio (${route.beginningDate}).`;
      }
      
      // 3. If dates are the same, check times
      if (endingDateOnly.getTime() === beginningDateOnly.getTime()) {
        if (!route.beginningTime || !route.endingTime) {
          return `Ruta #${idx + 1}: Las horas de inicio y fin son obligatorias cuando las fechas son las mismas.`;
        }

        // Parse hours and minutes
        const [bh, bm] = route.beginningTime.split(':').map(Number);
        const [eh, em] = route.endingTime.split(':').map(Number);
        
        const beginningMinutes = bh * 60 + bm;
        const endingMinutes = eh * 60 + em;

        if (endingMinutes <= beginningMinutes) { // Use <= to enforce "posterior" (strictly after)
          return `Ruta #${idx + 1}: La hora de fin (${route.endingTime}) debe ser posterior a la hora de inicio (${route.beginningTime}) cuando las fechas son las mismas.`;
        }
      }
    }
    return null; // No errors found
  };

  /**
   * Sets a toast notification that automatically hides after the specified duration.
   * Disables the submit button during the notification display.
   * @param {string} message - The toast message
   * @param {'success' | 'error'} type - The toast type
   * @param {number} duration - How long to display the toast (default: 2000ms)
   * @returns {void}
   */
  const handleSetToast = (message: string, type: 'success' | 'error', duration: number = 2000) => {
    setDisabledButton(true);
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
      setDisabledButton(false);
    }, duration);
  };

  /**
   * Handles submission of a new travel request.
   * Validates all required fields and route data before sending to API.
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const routeError = validateRoutes();
    if (routeError) {
      setError(routeError);
      handleSetToast('Por favor, completa todos los campos requeridos de forma correcta antes de enviar la solicitud.', 'error');
      return;
    }

    const firstRoute = formData.routes[0];
    if (
      !firstRoute.originCountryName ||
      !firstRoute.originCityName ||
      !firstRoute.destinationCountryName ||
      !firstRoute.destinationCityName ||
      !firstRoute.beginningDate ||
      !firstRoute.beginningTime ||
      !firstRoute.endingDate ||
      !firstRoute.endingTime ||
      !formData.requestedFee ||
      !formData.notes
    ) {
      setError('Por favor, completa todos los campos requeridos de forma correcta antes de enviar la solicitud.');
      handleSetToast('Por favor, completa todos los campos requeridos de forma correcta antes de enviar la solicitud.', 'error');
      return;
    }

    setError(null);

    const dataToSend = {
      routeIndex: firstRoute.routeIndex,
      notes: formData.notes,
      requestedFee: parseFloat(formData.requestedFee as string) || 0,
      imposedFee: 0,
      originCountryName: firstRoute.originCountryName,
      originCityName: firstRoute.originCityName,
      destinationCountryName: firstRoute.destinationCountryName,
      destinationCityName: firstRoute.destinationCityName,
      beginningDate: firstRoute.beginningDate,
      beginningTime: firstRoute.beginningTime,
      endingDate: firstRoute.endingDate,
      endingTime: firstRoute.endingTime,
      planeNeeded: firstRoute.planeNeeded,
      hotelNeeded: firstRoute.hotelNeeded,
      additionalRoutes: formData.routes.slice(1).map((route, idx) => ({
        ...route,
        routeIndex: idx + 1
      })),
    };
    try {
      await apiRequest(`/applicant/create-travel-request/${userId}`, {
        method: 'POST',
        data: dataToSend,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setToast({ message: 'Solicitud creada y enviada exitosamente.', type: 'success' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (role === "Solicitante") {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/solicitudes-autorizador';
      }
    } catch (error) {
      // TODO: Implement proper error handling to extract specific error messages from API
      setError('Hubo un error al enviar la solicitud.');
      setToast({ message: 'Hubo un error al enviar la solicitud.', type: 'error' });
    }
  };

  /**
   * Saves the form data as a draft without full validation.
   * Allows partial completion and provides warning for invalid dates.
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();

    const routeError = validateRoutes();
    if (routeError) {
      handleSetToast(routeError + " Los campos válidos se guardarán en el borrador.", 'error', 4000);
    }

    const firstRoute = formData.routes[0] || {};
    const draftData: Record<string, any> = {};

    if (firstRoute.routeIndex !== undefined) draftData.routeIndex = firstRoute.routeIndex;
    if (formData.notes) draftData.notes = formData.notes;
    if (formData.requestedFee) draftData.requestedFee = parseFloat(formData.requestedFee as string) || 0;
    draftData.imposedFee = 0; // Always send imposedFee as 0

    if (firstRoute.originCountryName) draftData.originCountryName = firstRoute.originCountryName;
    if (firstRoute.originCityName) draftData.originCityName = firstRoute.originCityName;
    if (firstRoute.destinationCountryName) draftData.destinationCountryName = firstRoute.destinationCountryName;
    if (firstRoute.destinationCityName) draftData.destinationCityName = firstRoute.destinationCityName;
    if (firstRoute.beginningDate) draftData.beginningDate = firstRoute.beginningDate;
    if (firstRoute.beginningTime) draftData.beginningTime = firstRoute.beginningTime;
    if (firstRoute.endingDate) draftData.endingDate = firstRoute.endingDate;
    if (firstRoute.endingTime) draftData.endingTime = firstRoute.endingTime;
    if (firstRoute.planeNeeded) draftData.planeNeeded = firstRoute.planeNeeded;
    if (firstRoute.hotelNeeded) draftData.hotelNeeded = firstRoute.hotelNeeded;

    const additionalRoutes = formData.routes.slice(1)
      .map((route, idx) => ({
        ...route,
        routeIndex: idx + 1
      }))
      .filter(route =>
        route.originCountryName ||
        route.originCityName ||
        route.destinationCountryName ||
        route.destinationCityName ||
        route.beginningDate ||
        route.beginningTime ||
        route.endingDate ||
        route.endingTime ||
        route.planeNeeded ||
        route.hotelNeeded
      );

    if (additionalRoutes.length > 0) {
      draftData.additionalRoutes = additionalRoutes;
    } else {
      draftData.additionalRoutes = [];
    }

    try {
      await apiRequest(`/applicant/create-draft-travel-request/${userId}`, {
        method: 'POST',
        data: draftData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      handleSetToast('Borrador guardado exitosamente.', 'success');
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = '/solicitudes-draft';
    } catch (err) {
      // TODO: Implement proper error handling to extract specific error messages from API
      setError('Hubo un error al guardar el borrador.');
      handleSetToast('Hubo un error al guardar el borrador. Por favor, inténtalo de nuevo.', 'error');
    }
  };

  /**
   * Handles editing of an existing request or draft.
   * Supports both full validation mode (for submission) and partial validation mode (for drafts).
   * @param {React.FormEvent} e - The form submission event
   * @param {boolean} completeForm - Whether to enforce full validation
   * @param {string} href_route - The redirect URL after successful edit
   * @returns {Promise<boolean>} True if edit was successful, false otherwise
   */
  const handleEditRequest = async (
    e: React.FormEvent,
    completeForm: boolean,
    href_route?: string
  ): Promise<boolean> => {
    e.preventDefault();

    if (completeForm) {
      const routeError = validateRoutes();
      if (routeError) {
        setError(routeError);
        handleSetToast("Hubo un error al editar la solicitud. Por favor, inténtalo de nuevo.", 'error');
        return false;
      }

      const firstRoute = formData.routes[0];
      const missingFields = [
        firstRoute.originCountryName,
        firstRoute.originCityName,
        firstRoute.destinationCountryName,
        firstRoute.destinationCityName,
        firstRoute.beginningDate,
        firstRoute.beginningTime,
        firstRoute.endingDate,
        firstRoute.endingTime,
        formData.requestedFee,
        formData.notes,
      ].some(field => !field);

      if (missingFields) {
        setError('Por favor, completa todos los campos requeridos de forma correcta antes de enviar la solicitud.');
        handleSetToast('Por favor, completa todos los campos requeridos de forma correcta antes de enviar la solicitud.', 'error');
        return false;
      }
    } else {
      const routeError = validateRoutes();
      if (routeError) {
        handleSetToast(routeError + " Los cambios se guardarán, pero los campos de fecha/hora inválidos deberán corregirse para enviar la solicitud.", 'error', 5000);
      }
    }

    setError(null);

    let editedData: Record<string, any> = {};
    const firstRoute = formData.routes[0];

    const includeIfExists = (key: string, value: any) => {
      if (value !== undefined && value !== '' && value !== null) {
        editedData[key] = value;
      }
    };

    includeIfExists('routeIndex', firstRoute.routeIndex);
    editedData.notes = typeof formData.notes === 'string' ? formData.notes.trim() : '';
    includeIfExists('requestedFee', parseFloat(formData.requestedFee as string));
    editedData.imposedFee = 0;
    includeIfExists('originCountryName', firstRoute.originCountryName);
    includeIfExists('originCityName', firstRoute.originCityName);
    includeIfExists('destinationCountryName', firstRoute.destinationCountryName);
    includeIfExists('destinationCityName', firstRoute.destinationCityName);
    includeIfExists('beginningDate', firstRoute.beginningDate);
    includeIfExists('beginningTime', firstRoute.beginningTime);
    includeIfExists('endingDate', firstRoute.endingDate);
    includeIfExists('endingTime', firstRoute.endingTime);
    editedData.planeNeeded = firstRoute.planeNeeded;
    editedData.hotelNeeded = firstRoute.hotelNeeded;

    const additionalRoutes = formData.routes
      .slice(1)
      .map((route, idx) => ({
        ...route,
        routeIndex: idx + 1,
      }))
      .filter(route =>
        route.originCountryName ||
        route.originCityName ||
        route.destinationCountryName ||
        route.destinationCityName ||
        route.beginningDate ||
        route.beginningTime ||
        route.endingDate ||
        route.endingTime ||
        route.planeNeeded ||
        route.hotelNeeded
      );

    if (additionalRoutes.length > 0) {
      editedData.additionalRoutes = additionalRoutes;
    } else {
      editedData.additionalRoutes = [];
    }

    try {
      await apiRequest(`/applicant/edit-travel-request/${requestId}`, {
        method: 'PUT',
        data: editedData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (href_route) {
        setToast({ message: 'Cambios guardados exitosamente.', type: 'success' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        window.location.href = href_route;
      }
      return true;
    } catch (err) {
      // TODO: Implement proper error handling to extract specific error messages from API
      setError('Hubo un error al editar la solicitud. Por favor, inténtalo de nuevo.');
      handleSetToast('Hubo un error al editar la solicitud. Por favor, inténtalo de nuevo.', 'error');
      return false;
    }
  };

  /**
   * Completes a draft by finalizing it as a submitted request.
   * Performs full validation before completing the draft.
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleFinishDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const routeError = validateRoutes();
    if (routeError) {
      setError(routeError);
      handleSetToast("Por favor, completa todos los campos requeridos de forma correcta antes de enviar la solicitud.", 'error');
      return;
    }

    const firstRoute = formData.routes[0];
    if (
      !firstRoute.originCountryName ||
      !firstRoute.originCityName ||
      !firstRoute.destinationCountryName ||
      !firstRoute.destinationCityName ||
      !firstRoute.beginningDate ||
      !firstRoute.beginningTime ||
      !firstRoute.endingDate ||
      !firstRoute.endingTime ||
      !formData.requestedFee ||
      !formData.notes
    ) {
      setError('Por favor, completa todos los campos requeridos de forma correcta antes de enviar la solicitud.');
      handleSetToast('Por favor, completa todos los campos requeridos de forma correcta antes de enviar la solicitud.', 'error');
      return;
    }

    const editSuccess = await handleEditRequest(e, true);
    if (!editSuccess) return;

    try {
      await apiRequest(`/applicant/confirm-draft-travel-request/${userId}/${requestId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      handleSetToast('Borrador completado exitosamente.', 'success');
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = '/solicitudes-draft';
    } catch (err) {
      // TODO: Implement proper error handling to extract specific error messages from API
      setError('Hubo un error al completar el borrador. Por favor, inténtalo de nuevo.');
      handleSetToast('Hubo un error al completar el borrador. Por favor, inténtalo de nuevo.', 'error');
    }
  };

  /**
   * Resets the form to its initial state and clears any error/toast messages.
   * @returns {void}
   */
  const handleResetForm = () => {
    setFormData(initialFormState);
    setError(null);
    setToast(null);
  };

  return (
    <form onSubmit={handleSubmitRequest} className="space-y-8">
      {/* Required Fields Notice */}
      <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded shadow-sm mb-4">
        <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
        </svg>
        <p className="text-sm text-blue-900 font-medium">
          Los campos obligatorios están marcados con un asterisco.
        </p>
      </div>

      {/* Render all routes dynamically */}
      {formData.routes.map((route, index) => (
        <RouteInputGroup
          key={route.routeIndex}
          route={route}
          onChange={handleRouteUpdate}
          index={index}
          onRemove={removeRoute}
          isRemovable={formData.routes.length > 1}
        />
      ))}

      {/* Button to add more routes */}
      <div className="flex justify-start mt-6">
        <button
          type="button"
          onClick={addRoute}
          className="bg-blue-600 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          + Agregar Ruta a mi Viaje
        </button>
      </div>

      <hr className="my-8 border-gray-300" />

      {/* General Trip Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Detalles Generales del Viaje</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Anticipo Esperado (MXN)<span className="text-red-500"> *</span></label>
          <input name="requestedFee" placeholder="Anticipo Esperado (MXN)" type="number" className={inputStyle} value={formData.requestedFee === 0 ? '' : formData.requestedFee} onChange={handleGeneralChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Observaciones / Comentarios<span className="text-red-500"> *</span></label>
          <textarea name="notes" rows={4} className="w-full border p-2 rounded-md" value={formData.notes} onChange={handleGeneralChange} required></textarea>
        </div>
      </div>

      {/* Department Info */}
      {deptData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Centro de Costos</label>
            <input
              type="text"
              value={deptData.costs_center}
              disabled
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <input
              type="text"
              value={deptData.department_name}
              disabled
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>
        </div>
      )}

      {/* Error and Info Messages */}
      { error && (
        <div className="bg-red-200 text-red-800 p-4 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {mode === 'draft' && !error && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          <p className="text-sm">Estás editando un borrador. Asegúrate de completar todos los campos antes de enviar.</p>
        </div>
      )}
      {mode === 'edit' && !error && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          <p className="text-sm">Estás editando una solicitud existente. Asegúrate de revisar todos los campos antes de actualizar.</p>
        </div>
      )}
      {mode === 'create' && !error && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded-md">
          <p className="text-sm">Estás creando una nueva solicitud de viaje. Completa todos los campos requeridos.</p>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button type="button" onClick={handleResetForm} className="disabled:bg-gray-400 disabled:cursor-not-allowed bg-red-500 text-white px-6 py-2 rounded-md shadow hover:bg-red-600 transition-colors"
          disabled={disabledButton}
        >
          Limpiar Formulario
        </button>
        {mode == 'create' && (
          <div className='flex gap-3'>
            <button type="button" onClick={handleSaveDraft} className="disabled:bg-gray-400 disabled:cursor-not-allowed bg-gray-500 text-white px-6 py-2 rounded-md shadow hover:bg-gray-600 transition-colors"
              disabled={disabledButton}
            >
              Guardar Borrador
            </button>
            <button type="button" onClick={handleSubmitRequest} className="disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-600 text-white px-6 py-2 rounded-md shadow hover:bg-green-700 transition-colors"
              disabled={disabledButton}
            >
              Enviar Solicitud
            </button>
          </div>
        )}
        {mode == 'edit' && (
          <button type="button"
            onClick={async (e) => {
              await handleEditRequest(e as unknown as React.FormEvent, true, '/dashboard');
            }}
            className="disabled:bg-gray-400 disabled:cursor-not-allowed bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition-colors"
            disabled={disabledButton}
          >
            Actualizar Solicitud
          </button>
        )}
        {mode == 'draft' && (
          <div className='flex gap-3'>
            <button type="button"
              onClick={async (e) => {
                await handleEditRequest(e as unknown as React.FormEvent, false, '/solicitudes-draft');
              }}
              className="disabled:bg-gray-400 disabled:cursor-not-allowed bg-gray-500 text-white px-6 py-2 rounded-md shadow hover:bg-gray-600 transition-colors"
              disabled={disabledButton}
            >
              Guardar Cambios
            </button>
            <button type="button" onClick={handleFinishDraft} className="disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-600 text-white px-6 py-2 rounded-md shadow hover:bg-green-700 transition-colors"
              disabled={disabledButton}
            >
              Enviar Solicitud
            </button>
          </div>
        )}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </form>
  );
}
