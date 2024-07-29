import { Button } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";
import { DataTable } from "../../components/Common/DataTable/DataTable";
import { Fetch } from "../../utils/Fetch";

export default function CustomerAssistanceVideos() {
  const {
    data: videos,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["customerAssistanceVideos"],
    queryFn: async () => {
      try {
        const res = await Fetch({
          url: "/r2/videos",
          method: "GET",
        });

        console.log("res?.data?", res);
        return res?.data?.videos;
      } catch (error) {
        console.error("res?.data?", err);
        toast.error("Failed to fetch customer assistance videos");

        throw err;
      }
    },
  });

  const { isLoading: isDownloadLoading, mutateAsync: handleDownload } =
    useMutation({
      mutationKey: ["downloadVideo"],
      mutationFn: async (video) => {
        try {
          const res = await Fetch({
            url: `/r2/videos/${video.Key}`,
            method: "GET",
            responseType: "blob",
          });

          const url = window.URL.createObjectURL(
            new Blob([res.data], { type: "video/mp4" })
          );

          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${video.Key}`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
          return res.data;
        } catch (error) {
          console.error("Failed to download video", error);
          toast.error("Failed to download video");
          throw error;
        }
      },
    });

  const handleDelete = (row) => {};

  const columns = [
    {
      accessorKey: "Key",
      header: "Video Name",
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        console.log(row?.original);
        return (
          <div className="flex flex-row gap-2">
            <Button
              onClick={() => handleDownload(row?.original)}
              variant="contained"
              size="small"
              disabled={isDownloadLoading}
            >
              Download
            </Button>
            <Button
              onClick={() => handleDelete(row?.original)}
              color="error"
              variant="outlined"
              size="small"
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminPageWrapper heading="Customer Assistance Videos">
      <div>
        <DataTable data={videos ?? []} columns={columns} refetch={refetch} />
      </div>
    </AdminPageWrapper>
  );
}
