import  {Component, ErrorInfo, ReactNode } from 'react'
import { DisplayError} from '../utils'
import './Error.scss'

export const ErrorFallBack = ({error}:{error:any}) => {
    return(
        <div className='error-fallback' >
        <h1 className='error-heading'>Error has happened!</h1>
            <DisplayError error={error}/>
            <button onClick={()=>window.location.reload()}>Reload</button>
        </div>
    )
}
interface Props {
    children?: ReactNode;
  }
  
  interface State {
    hasError: boolean;
    error:any;
  }
  
  class ErrorBoundary extends Component<Props, State> {
    public state: State = {
      hasError: false,
      error:null
    };
  
    public static getDerivedStateFromError(_: Error): State {
      // Update state so the next render will show the fallback UI.
      return {error:_, hasError: true };
    }
  
    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error("Uncaught error:", error, errorInfo);
    }
  
    public render() {
      if (this.state.hasError) {
        return <ErrorFallBack error={this.state.error}/>
      }
  
      return this.props.children;
    }
  }
  
  export default ErrorBoundary;