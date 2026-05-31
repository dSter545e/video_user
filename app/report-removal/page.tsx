import { Metadata } from "next";
import ReportRemovalClient from "./ReportRemovalClient";

export const metadata: Metadata = {
  title: "Video Removal Request",
  description: "Submit a request to remove a video from xHub4u.",
};

export default function ReportRemovalPage() {
  return <ReportRemovalClient />;
}
