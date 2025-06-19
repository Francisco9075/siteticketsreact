import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Criarbilhetes from "../components/form/form-elements/criarbilhetes";

export default function Criarbilhetespage() {
  // Estado para armazenar os dados do bilhete
  const [bilheteData, setBilheteData] = useState({
    evento: '',
    tipoBilhete: '',
    precoLiquido: '',
    quantidade: '',
    dataEvento: '',
    gratuito: false
  });
  return (
    <div>
      <PageMeta
        title="Criar Bilhetes"
        description="pagina para a criacao de bilhetes"
      />
      
      <PageBreadcrumb pageTitle="Configuração de Bilhetes" />
      
      {/* Container principal com grid para dois cartões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Primeiro Cartão */}
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <div className="mx-auto w-full">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Configuração de Bilhetes
            </h3>
            
            <Criarbilhetes/>
          </div>
        </div>

        {/* Segundo Cartão - Pré-visualização */}
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <div className="mx-auto w-full">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Pré-visualização
            </h3>
            
            {/* Pré-visualização do Bilhete */}
            <div className="space-y-4">
              {/* Bilhete Preview */}
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg overflow-hidden">
                {/* Padrão decorativo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                
                {/* Conteúdo do bilhete */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">
                        {bilheteData.evento || 'Nome do Evento'}
                      </h4>
                      <p className="text-blue-100 text-sm">
                        {bilheteData.tipoBilhete || 'Tipo de Bilhete'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {bilheteData.gratuito 
                          ? 'GRÁTIS' 
                          : bilheteData.precoLiquido 
                            ? `€${bilheteData.precoLiquido}` 
                            : '€0.00'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Data:</span>
                      <span>{bilheteData.dataEvento || 'Selecionar data'}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>Quantidade:</span>
                      <span>{bilheteData.quantidade || '0'} bilhetes</span>
                    </div>
                  </div>
                  
                  {/* Código de barras simulado */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex space-x-1">
                      {[...Array(20)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-white h-8 w-1 opacity-80"
                          style={{
                            height: Math.random() > 0.5 ? '32px' : '20px'
                          }}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-center mt-2 text-blue-100">
                      BILHETE-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Informações adicionais */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Resumo da Configuração
                </h5>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Evento:</span>
                    <span>{bilheteData.evento || 'Não definido'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span>{bilheteData.tipoBilhete || 'Não definido'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preço:</span>
                    <span>
                      {bilheteData.gratuito 
                        ? 'Gratuito' 
                        : bilheteData.precoLiquido 
                          ? `€${bilheteData.precoLiquido}` 
                          : 'Não definido'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantidade:</span>
                    <span>{bilheteData.quantidade || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span>{bilheteData.dataEvento || 'Não definida'}</span>
                  </div>
                </div>
              </div>
              
              {/* Nota informativa */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Esta é uma pré-visualização do seu bilhete. Os dados são atualizados automaticamente conforme você preenche o formulário.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}