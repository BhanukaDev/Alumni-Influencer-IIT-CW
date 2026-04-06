import { useEffect, useState } from 'react'
import {
  createCertification,
  createCourse,
  createDegree,
  createEmployment,
  createLicence,
  createProfile,
  deleteCertification,
  deleteCourse,
  deleteDegree,
  deleteEmployment,
  deleteLicence,
  getMyProfile,
  getProfileCompletion,
  updateProfile,
  updateProfileImage,
  type Profile,
} from '../services/profileApi'

function ProfileManagementPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [completion, setCompletion] = useState(0)
  const [missing, setMissing] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [degreeName, setDegreeName] = useState('')
  const [degreeUniversity, setDegreeUniversity] = useState('')

  const [certName, setCertName] = useState('')
  const [certIssuer, setCertIssuer] = useState('')

  const [licenceName, setLicenceName] = useState('')
  const [licenceBody, setLicenceBody] = useState('')

  const [courseName, setCourseName] = useState('')
  const [courseProvider, setCourseProvider] = useState('')

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [startDate, setStartDate] = useState('')

  const loadPage = async () => {
    try {
      setError('')
      const [loadedProfile, loadedCompletion] = await Promise.all([
        getMyProfile(),
        getProfileCompletion(),
      ])
      setProfile(loadedProfile)
      setCompletion(loadedCompletion.completion)
      setMissing(loadedCompletion.missing)
      setBio(loadedProfile?.bio ?? '')
      setLinkedinUrl(loadedProfile?.linkedinUrl ?? '')
      setImageUrl(loadedProfile?.imageUrl ?? '')
    } catch (loadError) {
      const text = loadError instanceof Error ? loadError.message : 'Could not load profile page'
      setError(text)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('')
        const [loadedProfile, loadedCompletion] = await Promise.all([
          getMyProfile(),
          getProfileCompletion(),
        ])
        setProfile(loadedProfile)
        setCompletion(loadedCompletion.completion)
        setMissing(loadedCompletion.missing)
        setBio(loadedProfile?.bio ?? '')
        setLinkedinUrl(loadedProfile?.linkedinUrl ?? '')
        setImageUrl(loadedProfile?.imageUrl ?? '')
      } catch (loadError) {
        const text = loadError instanceof Error ? loadError.message : 'Could not load profile page'
        setError(text)
      }
    }
    void fetchProfile()
  }, [])

  const saveProfile = async () => {
    try {
      setError('')
      setMessage('')

      if (!profile) {
        await createProfile({ bio, linkedinUrl, imageUrl })
        setMessage('Profile created')
      } else {
        await updateProfile({ bio, linkedinUrl })
        setMessage('Profile updated')
      }

      await loadPage()
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : 'Could not save profile'
      setError(text)
    }
  }

  const saveImage = async () => {
    try {
      setError('')
      setMessage('')
      await updateProfileImage(imageUrl)
      setMessage('Profile image updated')
      await loadPage()
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : 'Could not update image'
      setError(text)
    }
  }

  const addDegree = async () => {
    try {
      setError('')
      await createDegree({ name: degreeName, university: degreeUniversity })
      setDegreeName('')
      setDegreeUniversity('')
      setMessage('Degree added')
      await loadPage()
    } catch (addError) {
      const text = addError instanceof Error ? addError.message : 'Could not add degree'
      setError(text)
    }
  }

  const addCertification = async () => {
    try {
      setError('')
      await createCertification({ name: certName, issuer: certIssuer })
      setCertName('')
      setCertIssuer('')
      setMessage('Certification added')
      await loadPage()
    } catch (addError) {
      const text = addError instanceof Error ? addError.message : 'Could not add certification'
      setError(text)
    }
  }

  const addLicence = async () => {
    try {
      setError('')
      await createLicence({ name: licenceName, body: licenceBody })
      setLicenceName('')
      setLicenceBody('')
      setMessage('Licence added')
      await loadPage()
    } catch (addError) {
      const text = addError instanceof Error ? addError.message : 'Could not add licence'
      setError(text)
    }
  }

  const addCourse = async () => {
    try {
      setError('')
      await createCourse({ name: courseName, provider: courseProvider })
      setCourseName('')
      setCourseProvider('')
      setMessage('Course added')
      await loadPage()
    } catch (addError) {
      const text = addError instanceof Error ? addError.message : 'Could not add course'
      setError(text)
    }
  }

  const addEmployment = async () => {
    try {
      setError('')
      await createEmployment({ company, role, startDate })
      setCompany('')
      setRole('')
      setStartDate('')
      setMessage('Employment added')
      await loadPage()
    } catch (addError) {
      const text = addError instanceof Error ? addError.message : 'Could not add employment'
      setError(text)
    }
  }

  const removeDegree = async (id: number) => {
    try {
      await deleteDegree(id)
      setMessage('Degree deleted')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete degree'
      setError(text)
    }
  }

  const removeCertification = async (id: number) => {
    try {
      await deleteCertification(id)
      setMessage('Certification deleted')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete certification'
      setError(text)
    }
  }

  const removeLicence = async (id: number) => {
    try {
      await deleteLicence(id)
      setMessage('Licence deleted')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete licence'
      setError(text)
    }
  }

  const removeCourse = async (id: number) => {
    try {
      await deleteCourse(id)
      setMessage('Course deleted')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete course'
      setError(text)
    }
  }

  const removeEmployment = async (id: number) => {
    try {
      await deleteEmployment(id)
      setMessage('Employment deleted')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete employment'
      setError(text)
    }
  }

  return (
    <main className="page">
      <h1>Profile Management</h1>
      <p>Completion: {completion}%</p>
      {missing.length > 0 && <p>Missing: {missing.join(', ')}</p>}

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <section className="section">
        <h2>Basic Profile</h2>
        <div className="form">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />

          <label htmlFor="linkedin">LinkedIn URL</label>
          <input
            id="linkedin"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            type="url"
          />

          <button type="button" onClick={saveProfile}>
            {profile ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </section>

      <section className="section">
        <h2>Profile Image URL</h2>
        <div className="form">
          <label htmlFor="image">Image URL</label>
          <input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="url" />
          <button type="button" onClick={saveImage}>Update Image</button>
        </div>
      </section>

      <section className="section">
        <h2>Degrees</h2>
        <div className="form">
          <input placeholder="Degree name" value={degreeName} onChange={(e) => setDegreeName(e.target.value)} />
          <input
            placeholder="University"
            value={degreeUniversity}
            onChange={(e) => setDegreeUniversity(e.target.value)}
          />
          <button type="button" onClick={addDegree}>Add Degree</button>
        </div>
        <ul className="saved-list">
          {profile?.degrees.map((item) => (
            <li key={item.id}>
              {item.name} - {item.university} <button onClick={() => void removeDegree(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Certifications</h2>
        <div className="form">
          <input placeholder="Certification name" value={certName} onChange={(e) => setCertName(e.target.value)} />
          <input placeholder="Issuer" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} />
          <button type="button" onClick={addCertification}>Add Certification</button>
        </div>
        <ul className="saved-list">
          {profile?.certifications.map((item) => (
            <li key={item.id}>
              {item.name} - {item.issuer}{' '}
              <button onClick={() => void removeCertification(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Licences</h2>
        <div className="form">
          <input placeholder="Licence name" value={licenceName} onChange={(e) => setLicenceName(e.target.value)} />
          <input placeholder="Body" value={licenceBody} onChange={(e) => setLicenceBody(e.target.value)} />
          <button type="button" onClick={addLicence}>Add Licence</button>
        </div>
        <ul className="saved-list">
          {profile?.licences.map((item) => (
            <li key={item.id}>
              {item.name} - {item.body} <button onClick={() => void removeLicence(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Courses</h2>
        <div className="form">
          <input placeholder="Course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
          <input
            placeholder="Provider"
            value={courseProvider}
            onChange={(e) => setCourseProvider(e.target.value)}
          />
          <button type="button" onClick={addCourse}>Add Course</button>
        </div>
        <ul className="saved-list">
          {profile?.courses.map((item) => (
            <li key={item.id}>
              {item.name} - {item.provider} <button onClick={() => void removeCourse(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Employment</h2>
        <div className="form">
          <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <button type="button" onClick={addEmployment}>Add Employment</button>
        </div>
        <ul className="saved-list">
          {profile?.employments.map((item) => (
            <li key={item.id}>
              {item.company} - {item.role} ({item.startDate.slice(0, 10)}){' '}
              <button onClick={() => void removeEmployment(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default ProfileManagementPage
