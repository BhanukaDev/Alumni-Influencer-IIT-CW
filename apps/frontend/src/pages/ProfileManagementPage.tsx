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

type FieldErrors = Record<string, string>

function ProfileManagementPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [completion, setCompletion] = useState(0)
  const [missing, setMissing] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [programme, setProgramme] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [industrySector, setIndustrySector] = useState('')

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

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const fe = (field: string) => fieldErrors[field]

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
      setProgramme(loadedProfile?.programme ?? '')
      setGraduationYear(loadedProfile?.graduationYear?.toString() ?? '')
      setIndustrySector(loadedProfile?.industrySector ?? '')
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
        setProgramme(loadedProfile?.programme ?? '')
        setGraduationYear(loadedProfile?.graduationYear?.toString() ?? '')
        setIndustrySector(loadedProfile?.industrySector ?? '')
      } catch (loadError) {
        const text = loadError instanceof Error ? loadError.message : 'Could not load profile page'
        setError(text)
      }
    }
    void fetchProfile()
  }, [])

  const saveProfile = async () => {
    const errors: FieldErrors = {}
    if (graduationYear) {
      const y = parseInt(graduationYear, 10)
      if (isNaN(y) || y < 1950 || y > 2099) errors.graduationYear = 'Enter a valid year'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }))
      return
    }

    try {
      setError('')
      setMessage('')
      const year = graduationYear ? parseInt(graduationYear, 10) : undefined
      if (!profile) {
        await createProfile({
          bio,
          linkedinUrl,
          programme,
          graduationYear: year,
          industrySector,
        })
        setMessage('Profile created')
      } else {
        await updateProfile({
          bio,
          linkedinUrl,
          programme,
          graduationYear: year,
          industrySector,
        })
        setMessage('Profile updated')
      }
      await loadPage()
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : 'Could not save profile'
      setError(text)
    }
  }

  const saveImage = async () => {
    const errors: FieldErrors = {}
    if (!imageUrl.trim()) errors.imageUrl = 'Image URL is required'
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }))
      return
    }

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
    const errors: FieldErrors = {}
    if (!degreeName.trim()) errors.degreeName = 'Degree name is required'
    if (!degreeUniversity.trim()) errors.degreeUniversity = 'University is required'
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }))
      return
    }

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
    const errors: FieldErrors = {}
    if (!certName.trim()) errors.certName = 'Certification name is required'
    if (!certIssuer.trim()) errors.certIssuer = 'Issuer is required'
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }))
      return
    }

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
    const errors: FieldErrors = {}
    if (!licenceName.trim()) errors.licenceName = 'Licence name is required'
    if (!licenceBody.trim()) errors.licenceBody = 'Issuing body is required'
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }))
      return
    }

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
    const errors: FieldErrors = {}
    if (!courseName.trim()) errors.courseName = 'Course name is required'
    if (!courseProvider.trim()) errors.courseProvider = 'Provider is required'
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }))
      return
    }

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
    const errors: FieldErrors = {}
    if (!company.trim()) errors.company = 'Company is required'
    if (!role.trim()) errors.role = 'Role is required'
    if (!startDate) errors.startDate = 'Start date is required'
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }))
      return
    }

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
      setMessage('Degree removed')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete degree'
      setError(text)
    }
  }

  const removeCertification = async (id: number) => {
    try {
      await deleteCertification(id)
      setMessage('Certification removed')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete certification'
      setError(text)
    }
  }

  const removeLicence = async (id: number) => {
    try {
      await deleteLicence(id)
      setMessage('Licence removed')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete licence'
      setError(text)
    }
  }

  const removeCourse = async (id: number) => {
    try {
      await deleteCourse(id)
      setMessage('Course removed')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete course'
      setError(text)
    }
  }

  const removeEmployment = async (id: number) => {
    try {
      await deleteEmployment(id)
      setMessage('Employment removed')
      await loadPage()
    } catch (deleteError) {
      const text = deleteError instanceof Error ? deleteError.message : 'Could not delete employment'
      setError(text)
    }
  }

  return (
    <main className="page">
      <h1 style={{ marginBottom: '16px' }}>Profile Management</h1>

      {/* Completion progress */}
      <div className="progress-bar-wrap" style={{ marginBottom: '16px' }}>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${completion}%` }} />
        </div>
        <p className="progress-bar-label">
          {completion}% complete
          {missing.length > 0 && (
            <> &mdash; missing: <span className="missing-note">{missing.join(', ')}</span></>
          )}
        </p>
      </div>

      {message && <p className="msg-success" style={{ marginBottom: '12px' }}>{message}</p>}
      {error && <p className="msg-error" style={{ marginBottom: '12px' }}>{error}</p>}

      {/* Basic Profile */}
      <section className="section">
        <h2>Basic Profile</h2>
        <div className="form">
          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="linkedin">LinkedIn URL</label>
            <input
              id="linkedin"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="www.linkedin.com/in/yourname"
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="programme">Programme</label>
              <input
                id="programme"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                placeholder="e.g. Computer Science"
              />
            </div>
            <div className="field">
              <label htmlFor="graduationYear">Graduation Year</label>
              <input
                id="graduationYear"
                className={fe('graduationYear') ? 'input-error' : ''}
                value={graduationYear}
                onChange={(e) => { setGraduationYear(e.target.value); clearFieldError('graduationYear') }}
                type="number"
                placeholder="e.g. 2023"
              />
              {fe('graduationYear') && <span className="field-error">{fe('graduationYear')}</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="industrySector">Industry Sector</label>
            <input
              id="industrySector"
              value={industrySector}
              onChange={(e) => setIndustrySector(e.target.value)}
              placeholder="e.g. Technology"
            />
          </div>

          <button type="button" onClick={saveProfile}>
            {profile ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </section>

      {/* Profile Image */}
      <section className="section">
        <h2>Profile Image</h2>
        <div className="form">
          <div className="field">
            <label htmlFor="image">Image URL</label>
            <input
              id="image"
              className={fe('imageUrl') ? 'input-error' : ''}
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); clearFieldError('imageUrl') }}
              placeholder="https://..."
            />
            {fe('imageUrl') && <span className="field-error">{fe('imageUrl')}</span>}
          </div>
          <button type="button" onClick={saveImage}>Update Image</button>
        </div>
      </section>

      {/* Degrees */}
      <section className="section">
        <h2>Degrees</h2>
        <div className="form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="degreeName">Degree name</label>
              <input
                id="degreeName"
                className={fe('degreeName') ? 'input-error' : ''}
                value={degreeName}
                onChange={(e) => { setDegreeName(e.target.value); clearFieldError('degreeName') }}
                placeholder="e.g. BSc Computer Science"
              />
              {fe('degreeName') && <span className="field-error">{fe('degreeName')}</span>}
            </div>
            <div className="field">
              <label htmlFor="degreeUniversity">University</label>
              <input
                id="degreeUniversity"
                className={fe('degreeUniversity') ? 'input-error' : ''}
                value={degreeUniversity}
                onChange={(e) => { setDegreeUniversity(e.target.value); clearFieldError('degreeUniversity') }}
                placeholder="e.g. University of Westminster"
              />
              {fe('degreeUniversity') && <span className="field-error">{fe('degreeUniversity')}</span>}
            </div>
          </div>
          <button type="button" onClick={addDegree}>Add Degree</button>
        </div>
        {profile?.degrees && profile.degrees.length > 0 && (
          <div className="items-list">
            {profile.degrees.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-text">
                  <strong>{item.name}</strong>
                  <span> &mdash; {item.university}</span>
                </div>
                <button className="btn-delete" onClick={() => void removeDegree(item.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Certifications */}
      <section className="section">
        <h2>Certifications</h2>
        <div className="form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="certName">Certification name</label>
              <input
                id="certName"
                className={fe('certName') ? 'input-error' : ''}
                value={certName}
                onChange={(e) => { setCertName(e.target.value); clearFieldError('certName') }}
                placeholder="e.g. AWS Solutions Architect"
              />
              {fe('certName') && <span className="field-error">{fe('certName')}</span>}
            </div>
            <div className="field">
              <label htmlFor="certIssuer">Issuer</label>
              <input
                id="certIssuer"
                className={fe('certIssuer') ? 'input-error' : ''}
                value={certIssuer}
                onChange={(e) => { setCertIssuer(e.target.value); clearFieldError('certIssuer') }}
                placeholder="e.g. Amazon Web Services"
              />
              {fe('certIssuer') && <span className="field-error">{fe('certIssuer')}</span>}
            </div>
          </div>
          <button type="button" onClick={addCertification}>Add Certification</button>
        </div>
        {profile?.certifications && profile.certifications.length > 0 && (
          <div className="items-list">
            {profile.certifications.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-text">
                  <strong>{item.name}</strong>
                  <span> &mdash; {item.issuer}</span>
                </div>
                <button className="btn-delete" onClick={() => void removeCertification(item.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Licences */}
      <section className="section">
        <h2>Licences</h2>
        <div className="form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="licenceName">Licence name</label>
              <input
                id="licenceName"
                className={fe('licenceName') ? 'input-error' : ''}
                value={licenceName}
                onChange={(e) => { setLicenceName(e.target.value); clearFieldError('licenceName') }}
                placeholder="e.g. Professional Engineer"
              />
              {fe('licenceName') && <span className="field-error">{fe('licenceName')}</span>}
            </div>
            <div className="field">
              <label htmlFor="licenceBody">Issuing body</label>
              <input
                id="licenceBody"
                className={fe('licenceBody') ? 'input-error' : ''}
                value={licenceBody}
                onChange={(e) => { setLicenceBody(e.target.value); clearFieldError('licenceBody') }}
                placeholder="e.g. Engineering Council"
              />
              {fe('licenceBody') && <span className="field-error">{fe('licenceBody')}</span>}
            </div>
          </div>
          <button type="button" onClick={addLicence}>Add Licence</button>
        </div>
        {profile?.licences && profile.licences.length > 0 && (
          <div className="items-list">
            {profile.licences.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-text">
                  <strong>{item.name}</strong>
                  <span> &mdash; {item.body}</span>
                </div>
                <button className="btn-delete" onClick={() => void removeLicence(item.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Courses */}
      <section className="section">
        <h2>Courses</h2>
        <div className="form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="courseName">Course name</label>
              <input
                id="courseName"
                className={fe('courseName') ? 'input-error' : ''}
                value={courseName}
                onChange={(e) => { setCourseName(e.target.value); clearFieldError('courseName') }}
                placeholder="e.g. Machine Learning Specialization"
              />
              {fe('courseName') && <span className="field-error">{fe('courseName')}</span>}
            </div>
            <div className="field">
              <label htmlFor="courseProvider">Provider</label>
              <input
                id="courseProvider"
                className={fe('courseProvider') ? 'input-error' : ''}
                value={courseProvider}
                onChange={(e) => { setCourseProvider(e.target.value); clearFieldError('courseProvider') }}
                placeholder="e.g. Coursera"
              />
              {fe('courseProvider') && <span className="field-error">{fe('courseProvider')}</span>}
            </div>
          </div>
          <button type="button" onClick={addCourse}>Add Course</button>
        </div>
        {profile?.courses && profile.courses.length > 0 && (
          <div className="items-list">
            {profile.courses.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-text">
                  <strong>{item.name}</strong>
                  <span> &mdash; {item.provider}</span>
                </div>
                <button className="btn-delete" onClick={() => void removeCourse(item.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Employment */}
      <section className="section">
        <h2>Employment</h2>
        <div className="form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                className={fe('company') ? 'input-error' : ''}
                value={company}
                onChange={(e) => { setCompany(e.target.value); clearFieldError('company') }}
                placeholder="e.g. Google"
              />
              {fe('company') && <span className="field-error">{fe('company')}</span>}
            </div>
            <div className="field">
              <label htmlFor="role">Role</label>
              <input
                id="role"
                className={fe('role') ? 'input-error' : ''}
                value={role}
                onChange={(e) => { setRole(e.target.value); clearFieldError('role') }}
                placeholder="e.g. Software Engineer"
              />
              {fe('role') && <span className="field-error">{fe('role')}</span>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="startDate">Start date</label>
            <input
              id="startDate"
              className={fe('startDate') ? 'input-error' : ''}
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); clearFieldError('startDate') }}
            />
            {fe('startDate') && <span className="field-error">{fe('startDate')}</span>}
          </div>
          <button type="button" onClick={addEmployment}>Add Employment</button>
        </div>
        {profile?.employments && profile.employments.length > 0 && (
          <div className="items-list">
            {profile.employments.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-text">
                  <strong>{item.role}</strong>
                  <span> at {item.company}</span>
                  <span> &mdash; from {item.startDate.slice(0, 7)}</span>
                </div>
                <button className="btn-delete" onClick={() => void removeEmployment(item.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default ProfileManagementPage
