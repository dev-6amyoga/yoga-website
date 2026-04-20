import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  Chip,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Fetch } from "../../../utils/Fetch";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";

/* ---------------- CSV EXPORT ---------------- */

const exportToCSV = (rows) => {
  if (!rows?.length) return;

  const headers = [
    "User ID",
    "Name",
    "Email",
    "Phone",
    "Plan Name",
    "Validity From",
    "Validity To",
    "Classes Allowed",
    "Classes Attended",
    "Classes Remaining",
    "Has Active Plan",
  ];

  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.user_id,
        `"${r.name ?? ""}"`,
        `"${r.email ?? ""}"`,
        `"${r.phone ?? ""}"`,
        `"${r.plan_name ?? ""}"`,
        r.validity_from
          ? new Date(r.validity_from).toISOString().slice(0, 10)
          : "",
        r.validity_to ? new Date(r.validity_to).toISOString().slice(0, 10) : "",
        r.classes_allowed ?? "",
        r.classes_attended ?? "",
        r.classes_remaining ?? "",
        r.has_active_plan ? "YES" : "NO",
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "students_plan_overview.csv";
  link.click();
};

/* ---------------- COMPONENT ---------------- */

export default function StudentsPlanTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isMobile = useMediaQuery("(max-width:768px)");

  /* ---- debounce search ---- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ---- fetch data ---- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await Fetch({
          url: "/user/get-attendance-stats-all-users",
          method: "GET",
        });
        setRows(res.data?.results?.[0] || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- filter ---- */
  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return rows;
    const s = debouncedSearch.toLowerCase();
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(s) ||
        r.email?.toLowerCase().includes(s) ||
        r.phone?.includes(s),
    );
  }, [rows, debouncedSearch]);

  /* ---- virtualization ---- */
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (isMobile ? 190 : 65),
    overscan: 8,
  });

  const desktopGrid = "70px 150px 240px 130px 180px 130px 130px 100px 110px";

  /* ---------------- UI ---------------- */

  return (
    <AdminPageWrapper heading="Students & Plans">
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="h6">
                Students Plan Overview ({filteredRows.length})
              </Typography>

              <Button
                variant="outlined"
                size="small"
                onClick={() => exportToCSV(filteredRows)}
                disabled={!filteredRows.length}
              >
                Export CSV
              </Button>
            </Box>

            <TextField
              fullWidth
              placeholder="Search by name, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            {!isMobile && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: desktopGrid,
                  fontWeight: 600,
                  borderBottom: "2px solid #ddd",
                  pb: 1.5,
                  mb: 1,
                  px: 0.5,
                }}
              >
                <Box>ID</Box>
                <Box>Name</Box>
                <Box>Email</Box>
                <Box>Phone</Box>
                <Box>Plan</Box>
                <Box>From</Box>
                <Box>To</Box>
                <Box textAlign="center">Remaining</Box>
                <Box>Status</Box>
              </Box>
            )}

            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                ref={parentRef}
                sx={{
                  height: isMobile ? 560 : 420,
                  overflow: "auto",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    height: rowVirtualizer.getTotalSize(),
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((vr) => {
                    const r = filteredRows[vr.index];

                    /* ---------- MOBILE CARD ---------- */
                    if (isMobile) {
                      return (
                        <Box
                          key={r.user_id}
                          ref={rowVirtualizer.measureElement}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${vr.start}px)`,
                            px: 0.5,
                          }}
                        >
                          <Card
                            variant="outlined"
                            sx={{
                              p: 2,
                              mb: 1.5,
                              backgroundColor: r.has_active_plan
                                ? "rgba(0,200,83,0.05)"
                                : "transparent",
                            }}
                          >
                            <Typography fontWeight={600}>{r.name}</Typography>
                            <Typography variant="body2">{r.email}</Typography>
                            <Typography variant="body2">
                              Phone: {r.phone || "—"}
                            </Typography>

                            <Typography variant="body2" mt={1}>
                              Plan: <b>{r.plan_name || "—"}</b>
                            </Typography>

                            <Typography variant="body2">
                              Validity:{" "}
                              {r.validity_from
                                ? new Date(r.validity_from).toLocaleDateString()
                                : "—"}{" "}
                              →{" "}
                              {r.validity_to
                                ? new Date(r.validity_to).toLocaleDateString()
                                : "—"}
                            </Typography>

                            <Typography variant="body2">
                              Remaining: <b>{r.classes_remaining ?? 0}</b>
                            </Typography>

                            <Box mt={1}>
                              {r.has_active_plan ? (
                                <Chip
                                  label="ACTIVE"
                                  size="small"
                                  color="success"
                                />
                              ) : (
                                <Chip
                                  label="NO PLAN"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Card>
                        </Box>
                      );
                    }

                    /* ---------- DESKTOP ROW ---------- */
                    return (
                      <Box
                        key={r.user_id}
                        ref={rowVirtualizer.measureElement}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${vr.start}px)`,
                          display: "grid",
                          gridTemplateColumns: desktopGrid,
                          alignItems: "center",
                          py: 1.5,
                          px: 0.5,
                          borderBottom: "1px solid #e8e8e8",
                          backgroundColor: r.has_active_plan
                            ? "rgba(0,200,83,0.05)"
                            : "transparent",
                          "&:hover": {
                            backgroundColor: r.has_active_plan
                              ? "rgba(0,200,83,0.1)"
                              : "rgba(0,0,0,0.02)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.user_id}
                        </Box>
                        <Box
                          sx={{
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.name}
                        </Box>
                        <Box
                          sx={{
                            fontSize: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            title: r.email,
                          }}
                        >
                          {r.email}
                        </Box>
                        <Box
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.phone || "—"}
                        </Box>
                        <Box
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            title: r.plan_name,
                          }}
                        >
                          {r.plan_name || "—"}
                        </Box>
                        <Box
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.validity_from
                            ? new Date(r.validity_from).toLocaleDateString()
                            : "—"}
                        </Box>
                        <Box
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.validity_to
                            ? new Date(r.validity_to).toLocaleDateString()
                            : "—"}
                        </Box>
                        <Box
                          sx={{
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.classes_remaining ?? 0}
                        </Box>
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-start" }}
                        >
                          {r.has_active_plan ? (
                            <Chip label="ACTIVE" size="small" color="success" />
                          ) : (
                            <Chip
                              label="NO PLAN"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </AdminPageWrapper>
  );
}
