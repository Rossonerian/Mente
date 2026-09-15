with open("src/navigation/AppRouter.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "const [patientDeviceLoading, setPatientDeviceLoading] = useState(true);",
    "const [patientDeviceLoading, setPatientDeviceLoading] = useState(true);\n  const [patientDeviceError, setPatientDeviceError] = useState(false);"
)

content = content.replace(
    "patientDeviceStore.getToken().then((token) => { if (active) setPatientToken(token); }).finally(() => { if (active) setPatientDeviceLoading(false); });",
    "patientDeviceStore.getToken().then((token) => { if (active) setPatientToken(token); }).catch((err) => { console.error(\"Failed to load token\", err); if (active) setPatientDeviceError(true); }).finally(() => { if (active) setPatientDeviceLoading(false); });"
)

content = content.replace(
    "if (!isDevelopmentMockMode && patientDeviceLoading) return <AppShell role=\"patient\" tabs={patientTabs} activeRoute=\"play\" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false} showPreviewBar={isDevelopmentBuild}><ConnectedFeatureState role=\"patient\" title=\"Preparing this device\" body=\"Checking whether this device is connected to a family…\" /></AppShell>;\n  if (!isDevelopmentMockMode && !patientToken)",
    "if (!isDevelopmentMockMode && patientDeviceLoading) return <AppShell role=\"patient\" tabs={patientTabs} activeRoute=\"play\" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false} showPreviewBar={isDevelopmentBuild}><ConnectedFeatureState role=\"patient\" title=\"Preparing this device\" body=\"Checking whether this device is connected to a family…\" /></AppShell>;\n  if (!isDevelopmentMockMode && patientDeviceError) return <AppShell role=\"patient\" tabs={patientTabs} activeRoute=\"play\" onNavigate={() => undefined} onSwitchRole={switchRole} showTabs={false} showPreviewBar={isDevelopmentBuild}><ConnectedFeatureState role=\"patient\" title=\"Device Error\" body=\"There was a problem preparing this device. Please restart the app or contact your caregiver.\" /></AppShell>;\n  if (!isDevelopmentMockMode && !patientToken)"
)

with open("src/navigation/AppRouter.tsx", "w") as f:
    f.write(content)
