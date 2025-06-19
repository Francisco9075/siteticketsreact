import { useState, useEffect } from 'react';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  country: string;
  city: string;
  postalCode: string;
  profilePhoto: string;
  fullName: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
} // This closing brace was missing

export function useUserProfile(userId = 1) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://192.168.1.217/perfil.php?action=profile&user_id=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}

export default function UserProfiles() {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Adicione um timestamp para evitar cache
      const timestamp = new Date().getTime();
      const response = await fetch(`http://192.168.1.217/perfil.php?action=profile&user_id=1&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setProfileData(result.data);
      } else {
        throw new Error(result.error || 'Erro ao carregar perfil');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      const response = await fetch('http://188.245.212.195/perfil.php?action=update&user_id=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar perfil');
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <>
        <PageMeta
          title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
          description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
        />
        <PageBreadcrumb pageTitle="Profile" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta
          title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
          description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
        />
        <PageBreadcrumb pageTitle="Profile" />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/[0.03] lg:p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Erro ao carregar perfil
            </h3>
            <p className="text-red-500 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchProfileData}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          {profileData && (
            <>
              <UserMetaCard 
                profileData={profileData} 
                onUpdate={updateProfile}
              />
              <UserInfoCard 
                profileData={profileData} 
                onUpdate={updateProfile}
              />
              <UserAddressCard 
                profileData={profileData} 
                onUpdate={updateProfile}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}