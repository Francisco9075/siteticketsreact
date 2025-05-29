import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Criarbilhetes from "../components/form/form-elements/criarbilhetes";




export default function Criarbilhetespage() {
  return (
    <div>
      <PageMeta
        title="Criar Bilhetes"
        description="pagina para a criacao de bilhetes"
      />

      <PageBreadcrumb pageTitle="Configuração de Bilhetes" />
      <div className=" rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10= xl:py-12">
        <div className="mx-auto w-full ">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Configuração de Bilhetes
          </h3>

          <Criarbilhetes />
        </div>
      </div>
    </div>
  )}
