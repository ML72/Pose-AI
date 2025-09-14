import { Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Your page imports */
import LandingPage from './pages/LandingPage';
import UploadPosePage from './pages/UploadPosePage';
import ResultsPage from './pages/ResultsPage';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Your CSS */
import './App.css';



setupIonicReact();

const App: React.FC = () => {

  return (
    <IonApp>
      <IonReactRouter basename={import.meta.env.BASE_URL}>
        <IonRouterOutlet>
          {/** Page routing here */}
          <Route exact path="/">
            <LandingPage />
          </Route>
          <Route exact path="/upload">
            <UploadPosePage />
          </Route>
          <Route exact path="/results">
            <ResultsPage />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
