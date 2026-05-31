import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const fmt = (n) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0
}).format(n)

export async function generateAndUploadPDF({ transactions, budgets, goals, debts, monthKey, userName, accessToken }) {
  const doc = new jsPDF()
  const [year, month] = monthKey.split('-')
  const monthName = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  // Filter transaksi bulan ini dan bulan lalu
  const prevMonth = new Date(year, month - 2)
  const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
  const monthTx = transactions.filter(t => t.date.startsWith(monthKey))
  const prevMonthTx = transactions.filter(t => t.date.startsWith(prevMonthKey))

  const income = monthTx.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
  const outcome = monthTx.filter(t => t.type === 'outcome').reduce((a, b) => a + b.amount, 0)
  const balance = income - outcome
  const prevOutcome = prevMonthTx.filter(t => t.type === 'outcome').reduce((a, b) => a + b.amount, 0)
  const prevIncome = prevMonthTx.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
  const savingRate = income > 0 ? Math.round((balance / income) * 100) : 0
  const avgDaily = outcome > 0 ? Math.round(outcome / new Date(year, month, 0).getDate()) : 0
  const outcomeDiff = prevOutcome > 0 ? Math.round(((outcome - prevOutcome) / prevOutcome) * 100) : null
  const incomeDiff = prevIncome > 0 ? Math.round(((income - prevIncome) / prevIncome) * 100) : null

  // Kategori terbesar
  const categoryMap = {}
  monthTx.filter(t => t.type === 'outcome').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
  })
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]

  // ========== HEADER ==========
  doc.setFillColor(10, 22, 40)
  doc.rect(0, 0, 210, 45, 'F')
  doc.setTextColor(192, 200, 216)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('MYFINANCE', 14, 20)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(61, 90, 128)
  doc.text('WEALTH TRACKER', 14, 28)
  doc.setTextColor(192, 200, 216)
  doc.setFontSize(13)
  doc.text(`Laporan Keuangan — ${monthName}`, 14, 38)
  doc.setFontSize(9)
  doc.setTextColor(61, 90, 128)
  doc.text(`${userName}  ·  Dibuat: ${new Date().toLocaleDateString('id-ID')}`, 14, 50)

  // ========== RINGKASAN ==========
  doc.setTextColor(10, 22, 40)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Ringkasan Keuangan', 14, 62)

  autoTable(doc, {
    startY: 66,
    head: [['Keterangan', 'Nominal', 'vs Bulan Lalu']],
    body: [
      ['Total Pemasukan', fmt(income), incomeDiff !== null ? `${incomeDiff > 0 ? '+' : ''}${incomeDiff}%` : '-'],
      ['Total Pengeluaran', fmt(outcome), outcomeDiff !== null ? `${outcomeDiff > 0 ? '+' : ''}${outcomeDiff}%` : '-'],
      ['Saldo Bersih', fmt(balance), ''],
      ['Jumlah Transaksi', `${monthTx.length} transaksi`, ''],
    ],
    headStyles: { fillColor: [10, 22, 40], textColor: [192, 200, 216], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 244, 255] },
  })

  // ========== ANALISIS ==========
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('2. Analisis Bulan Ini', 14, doc.lastAutoTable.finalY + 12)

  const analysisRows = [
    ['Saving Rate', `${savingRate}%`, savingRate >= 20 ? 'Bagus! Di atas 20%' : savingRate >= 0 ? 'Perlu ditingkatkan' : 'Pengeluaran melebihi pemasukan'],
    ['Rata-rata Pengeluaran Harian', fmt(avgDaily), ''],
    ['Kategori Pengeluaran Terbesar', topCategory ? topCategory[0] : '-', topCategory ? fmt(topCategory[1]) : ''],
  ]

  if (outcomeDiff !== null) {
    analysisRows.push([
      'Perbandingan Pengeluaran',
      `${outcomeDiff > 0 ? 'Naik' : 'Turun'} ${Math.abs(outcomeDiff)}% vs bulan lalu`,
      outcomeDiff > 0 ? 'Perlu diwaspadai' : 'Lebih hemat!'
    ])
  }

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [['Indikator', 'Nilai', 'Keterangan']],
    body: analysisRows,
    headStyles: { fillColor: [10, 22, 40], textColor: [192, 200, 216], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 244, 255] },
  })

  // ========== BUDGET STATUS ==========
  if (Object.keys(budgets).length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('3. Status Budget', 14, doc.lastAutoTable.finalY + 12)

    const budgetRows = Object.entries(budgets).map(([cat, budget]) => {
      const spent = monthTx.filter(t => t.type === 'outcome' && t.category === cat).reduce((a, b) => a + b.amount, 0)
      const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0
      const status = pct >= 100 ? 'Terlampaui' : pct >= 80 ? 'Hampir habis' : 'Aman'
      return [cat, fmt(budget), fmt(spent), `${pct}%`, status]
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Kategori', 'Budget', 'Terpakai', '%', 'Status']],
      body: budgetRows,
      headStyles: { fillColor: [10, 22, 40], textColor: [192, 200, 216], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
    })
  }

  // ========== TABUNGAN & GOAL ==========
  if (goals && goals.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('4. Status Tabungan & Goal', 14, doc.lastAutoTable.finalY + 12)

    const goalRows = goals.map(g => {
      const pct = Math.round((g.saved / g.target) * 100)
      const status = pct >= 100 ? 'Tercapai!' : `${pct}% tercapai`
      return [g.name, fmt(g.target), fmt(g.saved), status]
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Goal', 'Target', 'Terkumpul', 'Progress']],
      body: goalRows,
      headStyles: { fillColor: [10, 22, 40], textColor: [192, 200, 216], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
    })
  }

  // ========== HUTANG/PIUTANG ==========
  const activeDebts = debts ? debts.filter(d => !d.settled) : []
  if (activeDebts.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('5. Hutang & Piutang Aktif', 14, doc.lastAutoTable.finalY + 12)

    const debtRows = activeDebts.map(d => [
      d.type === 'hutang' ? 'Hutang' : 'Piutang',
      d.name,
      fmt(d.amount),
      d.note || '-',
      d.dueDate || '-'
    ])

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Tipe', 'Nama', 'Nominal', 'Catatan', 'Jatuh Tempo']],
      body: debtRows,
      headStyles: { fillColor: [10, 22, 40], textColor: [192, 200, 216], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
    })
  }

  // ========== DAFTAR TRANSAKSI ==========
  if (monthTx.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    const sectionNum = 4 + (goals?.length > 0 ? 1 : 0) + (activeDebts.length > 0 ? 1 : 0)
    doc.text(`${sectionNum}. Daftar Transaksi`, 14, doc.lastAutoTable.finalY + 12)

    const txRows = monthTx.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.note || '-',
      fmt(t.amount)
    ])

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Nominal']],
      body: txRows,
      headStyles: { fillColor: [10, 22, 40], textColor: [192, 200, 216], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
    })
  }

  // ========== FOOTER ==========
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`MyFinance Wealth Tracker  ·  ${monthName}  ·  Halaman ${i} dari ${pageCount}`, 14, 290)
  }

  // ========== UPLOAD KE DRIVE ==========
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
  formData.append('metadata', new Blob([JSON.stringify({
    name: fileName, mimeType: 'application/pdf', parents: [folderId]
  })], { type: 'application/json' }))
  formData.append('file', pdfBlob)

  const upload = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData
  })

  return await upload.json()
}