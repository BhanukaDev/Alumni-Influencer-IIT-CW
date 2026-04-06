import BackendStatus from './components/BackendStatus'
import CampaignForm from './components/forms/CampaignForm'
import ProfileForm from './components/forms/ProfileForm'
import './index.css'

function App() {
  return (
    <main className="page">
      <h1>Alumni Influencer</h1>

      <BackendStatus />

      <section className="section">
        <h2>Profile</h2>
        <ProfileForm />
      </section>

      <section className="section">
        <h2>Campaign</h2>
        <CampaignForm />
      </section>
    </main>
  )
}

export default App
