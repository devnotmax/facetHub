import React from 'react';
import { HealthStatus } from '@/components/HealthStatus';
import { BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 md:p-8">
      <header className="max-w-2xl mx-auto w-full text-center space-y-2 py-4">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <BookOpen className="size-3.5" />
          <span>FACET Recursos • UNT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Material de estudio para la FACET
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Apuntes, resúmenes, parciales y resoluciones organizados por carrera, año y materia.
        </p>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-6">
        <HealthStatus />
      </main>

      <footer className="max-w-2xl mx-auto w-full text-center py-4 border-t border-border/40 text-xs text-muted-foreground">
        <p>FACET Recursos &copy; {new Date().getFullYear()} • Semana 1: Base del proyecto</p>
      </footer>
    </div>
  );
};

export default App;
