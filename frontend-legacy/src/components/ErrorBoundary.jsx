import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-destructive/30 bg-card p-6 shadow-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
            <p className="text-xs text-muted-foreground">
              An unexpected error occurred in the application. You can refresh or try resetting the view state.
            </p>
            {this.state.error?.message && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-left font-mono text-xs text-muted-foreground overflow-auto max-h-28">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry Application
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
