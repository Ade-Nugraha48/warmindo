"use client";

import * as React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatIndonesianDate, maskPhoneNumber } from "@/lib/formatters";
import type { CampaignLogRecord } from "@/types/campaign.record";

interface CampaignHistoryTableProps {
  logs: CampaignLogRecord[];
}

export function CampaignHistoryTable({ logs }: CampaignHistoryTableProps) {
  return (
    <Card className="font-sans">
      <CardHeader className="border-b">
        <CardTitle className="text-sm font-semibold">
          Riwayat Kampanye
        </CardTitle>
        <CardAction>
          <Badge variant="secondary" className="tabular-nums">
            {logs.length} log
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="px-0">
        {logs.length === 0 ? (
          <div className="py-6">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Belum ada log kampanye tercatat</EmptyTitle>
                <EmptyDescription>
                  Pesan broadcast atau reaktivasi yang dikirim akan tercatat di
                  sini.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] pl-4">ID</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Kampanye</TableHead>
                <TableHead>Waktu Kirim</TableHead>
                <TableHead className="pr-4 text-right">Hasil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="pl-4 text-xs text-muted-foreground tabular-nums">
                    #{log.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground text-xs">
                      {log.customer_nama}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {maskPhoneNumber(log.customer_wa)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-foreground">
                    {log.jenis_kampanye}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatIndonesianDate(log.waktu_kirim)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {log.berhasil_reaktivasi ? (
                      <Badge variant="success">
                        <CheckCircle2 data-icon="inline-start" />
                        <span>Kembali berkunjung</span>
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Clock data-icon="inline-start" />
                        <span>Menunggu</span>
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
