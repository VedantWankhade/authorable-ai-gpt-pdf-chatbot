interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex flex-col space-y-4">
      {/* <header className="container sticky top-0 z-40 bg-white">
        <div className="h-16 border-b border-b-slate-200 py-4">
          <nav className="ml-4 pl-6">
            <a href="#" className="hover:text-slate-600 cursor-pointer">
              Home
            </a>
          </nav>
        </div>
      </header> */}
      <div>
        <main className="flex w-full flex-1 flex-col overflow-hidden mt-4" style={{color: "white" , background: 'black', margin: '0', padding:'2rem', height: '100vh', overflow: 'auto'}}>
          {children}
        </main>
      </div>
    </div>
  );
}
