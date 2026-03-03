export default function WorkspacePage() {
  return (
    <div style={{
      width: '100vw',
      height: '100svh',
      margin: 0,
      padding: 0,
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    }}>
      <iframe
        src="/office/office.html"
        style={{
          width: '100%',
          minHeight: '200vh',
          border: 'none',
          display: 'block',
          flexShrink: 0
        }}
        scrolling="yes"
        title="迪恩·温彻斯特的像素办公室"
      />
    </div>
  )
}
