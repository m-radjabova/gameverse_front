import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class GameRouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Game route failed to load.", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-center text-white">
          <section role="alert" className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
            <h1 className="text-2xl font-black sm:text-3xl">O'yin ochilmadi</h1>
            <p className="mt-3 text-white/70">
              Internet aloqasini tekshirib, o'yinni qayta yuklang.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-bold text-white transition hover:brightness-110"
            >
              Qayta urinish
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
