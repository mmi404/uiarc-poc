import { useEffect, useState } from 'react'
// Every import below resolves to real Arc source pulled from the public shadcn
// registry (https://uiarc.dev/r/<name>.json) into components/arc/, exactly where
// `npx shadcn@latest add @uiarc/<name>` would place it.
import { Input } from '@/components/arc/input/input'
import { Textarea } from '@/components/arc/textarea/textarea'
import { Select } from '@/components/arc/select/select'
import { Switch } from '@/components/arc/switch/switch'
import { Button } from '@/components/arc/button/button'

// --- "Create project" settings screen ---------------------------------------
// Assembled using ONLY the props documented on each component's markdown page.
//  - Input:    label, value, onChange, description, error        (inputs)
//  - Textarea: label, value, onChange, rows, description         (inputs)
//  - Select:   label, value, onValueChange, options[], description (inputs)
//  - Switch:   label, checked, onCheckedChange                    (inputs)
//  - Button:   variant, loading, onClick                          (actions)

function App() {
  const [dark, setDark] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [region, setRegion] = useState('us')
  const [analytics, setAnalytics] = useState(true)
  const [previewEnv, setPreviewEnv] = useState(false)
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<string | null>(null)

  // Dark mode is driven by `data-theme="dark"` on <html>, per llms.txt.
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  // Keep a URL-safe slug suggestion in sync until the user edits it themselves.
  const [slugEdited, setSlugEdited] = useState(false)
  useEffect(() => {
    if (!slugEdited) {
      setSlug(name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }, [name, slugEdited])

  const nameError = name.length > 0 && name.trim().length < 3 ? 'Use at least 3 characters' : undefined

  function handleCreate() {
    if (!name.trim() || nameError) return
    setSaving(true)
    setCreated(null)
    setTimeout(() => {
      setSaving(false)
      setCreated(
        JSON.stringify(
          { name: name.trim(), slug, description, visibility, region, analytics, previewEnv },
          null,
          2,
        ),
      )
    }, 1200)
  }

  return (
    <main className="page">
      <div className="topbar">
        <div>
          <h1>Create a new project</h1>
          <p>Assembled by an AI agent from Arc UI components.</p>
        </div>
        <label className="theme-toggle">
          Dark
          <Switch label="Dark mode" checked={dark} onCheckedChange={setDark} />
        </label>
      </div>

      <section className="card" aria-labelledby="create-project-title">
        <div className="card-head">
          <h2 id="create-project-title">Project details</h2>
          <p>Name your project and choose where it runs. You can change any of this later.</p>
        </div>

        <div className="card-body">
          <Input
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            description="Shown across your workspace and in invitations."
            error={nameError}
            placeholder="Harbour redesign"
            autoFocus
          />

          <Input
            label="Slug"
            value={slug}
            onChange={(e) => {
              setSlugEdited(true)
              setSlug(e.target.value)
            }}
            description="Used in URLs. Lowercase letters, numbers, and hyphens."
          />

          <Textarea
            label="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={280}
            description={`${280 - description.length} characters left`}
          />

          <div className="two-col">
            <Select
              label="Visibility"
              value={visibility}
              onValueChange={setVisibility}
              description="Who can see this project."
              options={[
                { value: 'private', label: 'Private' },
                { value: 'team', label: 'Team' },
                { value: 'public', label: 'Public' },
              ]}
            />
            <Select
              label="Region"
              value={region}
              onValueChange={setRegion}
              description="Where your data is hosted."
              options={[
                { value: 'us', label: 'United States' },
                { value: 'eu', label: 'Europe' },
                { value: 'ap', label: 'Asia Pacific' },
              ]}
            />
          </div>

          <div>
            <div className="toggle-row">
              <div>
                <div className="label">Usage analytics</div>
                <p className="hint">Collect anonymous usage to improve the product.</p>
              </div>
              <Switch label="Usage analytics" checked={analytics} onCheckedChange={setAnalytics} />
            </div>
            <div className="toggle-row">
              <div>
                <div className="label">Preview environments</div>
                <p className="hint">Spin up a disposable environment for each pull request.</p>
              </div>
              <Switch
                label="Preview environments"
                checked={previewEnv}
                onCheckedChange={setPreviewEnv}
              />
            </div>
          </div>
        </div>

        <div className="card-foot">
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={saving}
            disabled={!name.trim() || !!nameError}
            onClick={handleCreate}
          >
            {saving ? 'Creating…' : 'Create project'}
          </Button>
        </div>
      </section>

      {created && (
        <pre className="result" role="status">
          Project created:{'\n'}
          {created}
        </pre>
      )}
    </main>
  )
}

export default App
