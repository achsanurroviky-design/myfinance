import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const fmt = (n) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0
}).format(n)

export async function generateAndUploadPDF({ transactions, budgets, monthKey, userName, accessToken }) {
  const doc = new jsPDF()
  const [year, month] = monthKey.split('-')
  const monthName = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  doc.setFillColor(10, 22, 40)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(192, 200, 216)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('MYFINANCE', 14, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('WEALTH TRACKER', 14, 26)
  doc.setFontSize(12)
  doc.text(`Laporan Keuangan — ${monthName}`, 14, 35)
  doc.setTextColor(61, 90, 128)
  doc.setFontSize(9)
  doc.text(`Dibuat untuk: ${userName}`, 14, 42)

  const monthTx = transactions.filter(t => t.date.startsWith(monthKey))
  const income = monthTx.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
  const outcome = monthTx.filter(t => t.type === 'outcome').reduce((a, b) => a + b.amount, 0)
  const balance = income - outcome

  doc.setTextColor(10, 22, 40)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Ringkasan', 14, 54)

  autoTable(doc, {
    startY: 58,
    head: [['Keterangan', 'Nominal']],
    body: [
      ['Total Pemasukan', fmt(income)],
      ['Total Pengeluaran', fmt(outcome)],
      ['Saldo Bersih', fmt(balance)],
      ['Jumlah Transaksi', `${monthTx.length} transaksi`],
    ],
    headStyles: { fillColor: [10, 22, 40], textColor: [192, 200, 216] },
    alternateRowStyles: { fillColor: [240, 244, 255] },
    styles: { fontSize: 10 },
  })

  if (Object.keys(budgets).length > 0) {
    const budgetRows = Object.entries(budgets).map(([cat, budget]) => {
      const spent = monthTx.filter(t => t.type === 'outcome' && t.category === cat).reduce((a, b) => a + b.amount, 0)
      const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0
      const status = pct >= 100 ? 'Terlampaui' : pct >= 80 ? 'Hampir habis' : 'Aman'
      return [cat, fmt(budget), fmt(spent), `${pct}%`, status]
    })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Status Budget', 14, doc.lastAutoTable.finalY + 12)

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Kategori', 'Budget', 'Terpakai', '%', 'Status']],
      body: budgetRows,
      headStyles: { fillColor: [10, 22, 40], textColor: [192, 200, 216] },
      alternateRowStyles: { fillColor: [240, 244, 255] },
      styles: { fontSize: 9 },
    })
  }

  if (monthTx.length > 0) {
    const txRows = monthTx.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.note || '-',
      fmt(t.amount)
    ])

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Daftar Transaksi', 14, doc.lastAutoTable.finalY + 12)

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Nominal']],
      body: txRows,
      headStyles: { fillColor: [10, 22, 40], textColor: [192, 200, 216] },
      alternateRowStyles: { fillColor: [240, 244, 255] },
      styles: { fontSize: 8 },
    })
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`MyFinance Wealth Tracker — ${monthName} — Halaman ${i} dari ${pageCount}`, 14, 290)
  }

  const pdfBlob = doc.output('blob')
  const fileName = `MyFinance_${monthKey}.pdf`

  const folderSearch = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='MyFinance' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const folderData = await folderSearch.json()

  let folderId
  if (folderData.files && folderData.files.length > 0) {
    folderId = folderData.files[0].id
  } else {
    const createFolder = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'MyFinance', mimeType: 'application/vnd.google-apps.folder' })
    })
    const folderResult = await createFolder.json()
    folderId = folderResult.id
  }

  const formData = new FormData()
  formData.append('metadata', new Blob([JSON.stringify({ name: fileName, mimeType: 'application/pdf', parents: [folderId] })], { type: 'application/json' }))
  formData.append('file', pdfBlob)

  const upload = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData
  })

  return await upload.json()
}