import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

interface AnalysisData {
  jdFileName: string
  resumeFileName: string
  model: string
  version: string
  timestamp: Date
  answer: string
  result: any[]
}

/**
 * 生成 CSR 分析報告 Word 文件
 */
export async function generateCsrReportDocx(data: AnalysisData): Promise<void> {
  // 清理 HTML 標籤
  const cleanText = (html: string): string => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  // 格式化時間
  const formatDate = (date: Date): string => {
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 建立文件內容
  const sections: any[] = []

  // 標題
  sections.push(
    new Paragraph({
      text: 'CSR 人才技能量化分析報告',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  )

  // 基本資訊
  sections.push(
    new Paragraph({
      text: '分析資訊',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  )

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'JD 檔案：', bold: true }),
        new TextRun({ text: data.jdFileName })
      ],
      spacing: { after: 100 }
    })
  )

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Resume 檔案：', bold: true }),
        new TextRun({ text: data.resumeFileName })
      ],
      spacing: { after: 100 }
    })
  )

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '分析模型：', bold: true }),
        new TextRun({ text: data.model })
      ],
      spacing: { after: 100 }
    })
  )

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '版本：', bold: true }),
        new TextRun({ text: data.version })
      ],
      spacing: { after: 100 }
    })
  )

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '分析時間：', bold: true }),
        new TextRun({ text: formatDate(data.timestamp) })
      ],
      spacing: { after: 300 }
    })
  )

  // 分析結果
  sections.push(
    new Paragraph({
      text: '分析結果',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    })
  )

  // 將 Answer 內容分段處理
  const answerText = cleanText(data.answer)
  const answerParagraphs = answerText.split('\n').filter(line => line.trim().length > 0)
  
  answerParagraphs.forEach(paragraph => {
    sections.push(
      new Paragraph({
        text: paragraph,
        spacing: { after: 150 }
      })
    )
  })

  // Result 表格
  if (data.result && data.result.length > 0) {
    sections.push(
      new Paragraph({
        text: '詳細評估結果',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      })
    )

    // 建立表格
    const tableRows: TableRow[] = []

    // 表頭
    const headers = ['分析原因', '符合JD需求項目', '得分']
    tableRows.push(
      new TableRow({
        children: headers.map(header => 
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: header, bold: true })],
                alignment: AlignmentType.CENTER
              })
            ],
            shading: { fill: '4472C4' },
            width: { size: 33, type: WidthType.PERCENTAGE }
          })
        )
      })
    )

    // 資料行
    data.result.forEach(item => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: String(item.desc || '-') })],
              width: { size: 50, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ text: String(item.name || '-') })],
              width: { size: 33, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                new Paragraph({ 
                  text: String(item.score || '-'),
                  alignment: AlignmentType.CENTER 
                })
              ],
              width: { size: 17, type: WidthType.PERCENTAGE }
            })
          ]
        })
      )
    })

    const table = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
      }
    })

    sections.push(table)
  }

  // 建立文檔
  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  })

  // 生成並下載
  const blob = await Packer.toBlob(doc)
  const fileName = `CSR_分析報告_${data.jdFileName.replace(/\.[^/.]+$/, '')}_${formatDate(data.timestamp).replace(/[/:]/g, '-').replace(/\s/g, '_')}.docx`
  saveAs(blob, fileName)
}
