"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#121420] mb-4">
              Произошла ошибка
            </h1>
            <p className="text-[#4a4e65] mb-4">
              Пожалуйста, обновите страницу
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-[#475C8C] px-6 py-2 text-white hover:bg-[#475C8C]/90"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}








