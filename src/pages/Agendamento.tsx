import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgendamentoForm from "@/components/AgendamentoForm";

const Agendamento = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <AgendamentoForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Agendamento;