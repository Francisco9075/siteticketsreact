import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import SignOut from "./components/auth/SignOut";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Criarbilhetespage from "./pages/criarbilhetespage";
import CriarEventospage from "./pages/criareventospage";
import GerirBilhetes from "./components/tables/BasicTables/gerirbilhetes";
import GerirEventos from "./components/tables/BasicTables/GerirEventos";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GerirClientes from "./components/tables/BasicTables/gerirclientes";
import ProcessamentoPagamentos from "./pages/finaceiro";
import FinancialDashboard from "./pages/Dashboardfinanceira";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>


        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signout" element={<SignOut />} />


        {/* Páginas protegidas com layout */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="profile" element={<UserProfiles />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="blank" element={<Blank />} />


          {/* Forms */}
          <Route path="form-elements" element={<FormElements />} />
          <Route path="criarbilhetespage" element={<Criarbilhetespage />} />
          <Route path="CriarEventos" element={<CriarEventospage />} />
          <Route path="Financeiro" element={<ProcessamentoPagamentos/>}/>
          <Route path="DashboardFinanceira" element={<FinancialDashboard/>}/>
        


          {/* Tables */}
          <Route path="basic-tables" element={<BasicTables />} />
          <Route path="GerirBilhetes" element={<GerirBilhetes />} />
          <Route path="GerirEventos" element={<GerirEventos/>} />
          <Route path="GerirClientes" element={<GerirClientes/>}/>


          {/* UI Elements */}
          <Route path="alerts" element={<Alerts />} />
          <Route path="avatars" element={<Avatars />} />
          <Route path="badge" element={<Badges />} />
          <Route path="buttons" element={<Buttons />} />
          <Route path="images" element={<Images />} />
          <Route path="videos" element={<Videos />} />


          {/* Charts */}
          <Route path="line-chart" element={<LineChart />} />
          <Route path="bar-chart" element={<BarChart />} />
        </Route>


        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}



