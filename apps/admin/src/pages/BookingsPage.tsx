import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminSlotsApi, adminBookingsApi } from "@biocom/api";
import { formatKST } from "@biocom/utils";
import {
  Calendar,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@biocom/ui";

function parseStartAt(startAt: string) {
  const date = startAt.slice(0, 10);
  const time = startAt.slice(11, 16);
  return { date, time };
}
function parseEndAt(endAt: string) {
  return endAt.slice(11, 16);
}

export function BookingsPage() {
  const [dateFilter, setDateFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const { data: allSlots = [] } = useQuery({
    queryKey: ["slots"],
    queryFn: () =>
      adminSlotsApi.list({ includeBookings: true }).then((r) => r.data),
  });

  const slots = useMemo(() => {
    return allSlots.filter((s) => {
      const { date } = parseStartAt(s.startAt);
      return date === dateFilter;
    });
  }, [allSlots, dateFilter]);

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">슬롯별 예약자 조회</h2>
      <div className="mb-6">
        <label className="mb-2 block text-sm">날짜 선택</label>
        <Calendar value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="space-y-6">
        {slots.map((slot) => (
          <SlotBookings key={slot.id} slot={slot} />
        ))}
      </div>
    </div>
  );
}

function SlotBookings({
  slot,
}: {
  slot: { id: string; startAt: string; endAt: string };
}) {
  const { date, time } = parseStartAt(slot.startAt);
  const endStr = parseEndAt(slot.endAt);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", slot.id],
    queryFn: () => adminBookingsApi.listBySlot(slot.id).then((r) => r.data),
  });

  return (
    <div>
      <h3 className="mb-2 font-medium">
        {date} {time} ~ {endStr}
      </h3>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">이름</TableHead>
              <TableHead className="text-center">이메일</TableHead>
              <TableHead className="text-center">연락처</TableHead>
              <TableHead className="text-center">신청일시</TableHead>
              <TableHead> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <td
                  colSpan={5}
                  className="p-4 py-8 text-center align-middle text-muted-foreground"
                >
                  예약자 없음
                </td>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="text-center">{b.applicant.name}</TableCell>
                  <TableCell className="text-center">{b.applicant.email}</TableCell>
                  <TableCell className="text-center">{b.applicant.phone ?? "-"}</TableCell>
                  <TableCell className="text-center">{formatKST(b.createdAt, "datetime")}</TableCell>
                  <TableCell>
                    <Link
                      to={`/sessions/${b.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      상담 기록
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
