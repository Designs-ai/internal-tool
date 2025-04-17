const writeAndDownloadCSV = ({
  data,
  filename = "",
  header = "",
}: {
  data: string;
  filename?: string;
  header?: string;
}) => {
  const blob = new Blob([header + data], {
    type: "text/csv;charset=utf-8",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `haziq-hensem_${filename}.csv`;
  link.click();
};

export default writeAndDownloadCSV;
