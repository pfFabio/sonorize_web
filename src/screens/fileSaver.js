import jsPDF from "jspdf";


/**
 * Salva um conteúdo de texto em um arquivo (ex: .txt, .csv).
 * @param {string} content - O conteúdo a ser salvo.
 * @param {string} filename - O nome do arquivo com a extensão.
 * @param {string} [type='text/plain;charset=utf-8'] - O MIME type do arquivo.
 */
const saveAsTextFile = (content, filename, type = 'text/plain;charset=utf-8') => {
  try {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Erro ao salvar arquivo de texto:", err);
    window.alert("Não foi possível salvar o arquivo.");
  }
};

/**
 * Salva um conteúdo de texto em um arquivo PDF.
 * @param {string} content - O conteúdo a ser salvo.
 * @param {string} filename - O nome do arquivo com a extensão .pdf.
 */
const saveAsPdf = (content, filename) => {
  try {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180); // 180 é a largura máxima em mm
    doc.text(lines, 10, 10);
    doc.save(filename);
  } catch (err) {
    console.error("Erro ao salvar como PDF:", err);
    window.alert("Não foi possível salvar o arquivo PDF.");
  }
};

/**
 * Manipulador de salvamento que decide qual função usar com base no formato.
 * @param {string} textToSave - O texto da transcrição.
 * @param {'txt' | 'pdf' | 'csv'} format - O formato do arquivo.
 */
export const handleSave = (textToSave, format) => {
  if (!textToSave) {
    window.alert("Nada para salvar");
    return;
  }

  switch (format) {
    case 'txt': saveAsTextFile(textToSave, 'transcricao.txt'); break;
    case 'pdf': saveAsPdf(textToSave, 'transcricao.pdf'); break;
    case 'csv':
      const csvContent = `"${textToSave.replace(/"/g, '""')}"`;
      saveAsTextFile(csvContent, 'transcricao.csv', 'text/csv;charset=utf-8');
      break;
    default:
      console.error("Formato de arquivo desconhecido:", format);
      window.alert("Formato de arquivo não suportado.");
  }
};
