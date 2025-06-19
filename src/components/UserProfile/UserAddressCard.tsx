import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [address, setAddress] = useState({
    country: "",
    city: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch address data from API
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch('http://192.168.1.217/perfil.php?action=profile&user_id=1');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
          setAddress({
            country: data.data.country || "",
            city: data.data.city || "",
            postalCode: data.data.postalCode || ""
          });
        } else {
          setError(data.error || 'Failed to load address');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('http://192.168.1.217/perfil.php?action=update&user_id=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: address.country,
          city: address.city,
          postalCode: address.postalCode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage("Address updated successfully!");
        setTimeout(() => {
          closeModal();
          setSuccessMessage(null);
        }, 1500);
      } else {
        setError(data.error || 'Failed to update address');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleInputChange = (field: keyof typeof address, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="text-red-500 dark:text-red-400 text-center p-4">
        Error: {error}
        <button 
          onClick={() => window.location.reload()} 
          className="ml-2 text-blue-500 dark:text-blue-400 hover:underline"
        >
          Tente outra vez
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Zona de residencia
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div className="space-y-1">
              <p className="text-xs leading-normal text-gray-500 dark:text-gray-400">
                pais
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.country || <span className="text-gray-400 dark:text-gray-500">Not specified</span>}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs leading-normal text-gray-500 dark:text-gray-400">
                cidade
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.city || <span className="text-gray-400 dark:text-gray-500">Not specified</span>}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs leading-normal text-gray-500 dark:text-gray-400">
                codigo postal
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {address.postalCode || <span className="text-gray-400 dark:text-gray-500">Not specified</span>}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:self-start"
          aria-label="Edit address"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Editar
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              editar informacoes pessoais
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            
            </p>
          </div>
          
          {error && (
            <div className="mx-2 mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mx-2 mb-4 p-3 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="h-[450px] overflow-y-auto px-2 pb-3 custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">pais</Label>
                  <Input 
                    id="country"
                    type="text" 
                    value={address.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter your country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input 
                    id="city"
                    type="text" 
                    value={address.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter your city or state"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">codigo postal</Label>
                  <Input 
                    id="postalCode"
                    type="text" 
                    value={address.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="Enter your postal code"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                size="sm" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    guardar
                  </span>
                ) : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}