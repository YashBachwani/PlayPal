import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooking, Booking } from "@/contexts/BookingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Download, Home, Printer, Share2, Play } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { CricketDataLayer } from "@/lib/cricket";

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bookings } = useBooking();
    const [booking, setBooking] = useState<Booking | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            const foundBooking = bookings.find((b) => b.id === id);
            if (foundBooking) {
                setBooking(foundBooking);
            } else {
                toast.error("Booking not found");
                navigate("/dashboard");
            }
        }
    }, [id, bookings, navigate]);

    const handleDownloadOriginal = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return;

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                logging: false,
                useCORS: true,
                background: "#ffffff"
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`PlayPal-Invoice-${booking?.id || "download"}.pdf`);
            toast.success("Invoice downloaded successfully");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF");
        }
    };

    if (!booking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/30 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-foreground">Booking Confirmed!</h1>
                    <p className="text-muted-foreground mt-2">
                        Your booking at {booking.venueName} has been successfully confirmed.
                    </p>
                </div>

                <Card className="shadow-lg border-border/50 overflow-hidden" ref={invoiceRef}>
                    <div className="bg-primary/5 p-6 border-b border-border/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-primary">PlayPal</h2>
                                <p className="text-sm text-muted-foreground mt-1">Sports Booking Platform</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-sm font-medium text-muted-foreground">INVOICE</h3>
                                <p className="text-lg font-bold font-mono">#{booking.id.slice(-6).toUpperCase()}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(booking.createdAt), "PPP")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Customer Details
                                </h4>
                                <div className="space-y-1">
                                    <p className="font-medium text-lg">{booking.userName}</p>
                                    <p className="text-muted-foreground text-sm">{booking.userPhone}</p>
                                    <div className="mt-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded inline-block">
                                        Verified Customer
                                    </div>
                                </div>
                            </div>
                            <div className="md:text-right">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Booking Details
                                </h4>
                                <div className="space-y-1">
                                    <p className="font-semibold">{booking.venueName}</p>
                                    <p className="text-sm">{booking.sport}</p>
                                    <p className="text-sm">
                                        {format(new Date(booking.date), "PPP")} • {booking.timeSlot}
                                    </p>
                                    <div className="mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded inline-block">
                                        {booking.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                Payment Summary
                            </h4>
                            <div className="bg-secondary/20 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Court Fee (1 Hour)</span>
                                    <span>₹{booking.totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Service Fee</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>₹0.00</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Total Amount</span>
                                    <span className="text-xl font-bold text-primary">₹{booking.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-xs text-muted-foreground">
                            <p>Thank you for booking with PlayPal. Please show this invoice at the venue.</p>
                            <p className="mt-1">For support, contact help@playpal.com</p>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-secondary/10 p-6 flex flex-col sm:flex-row gap-3 justify-between border-t border-border/50">
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/")}>
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={async () => {
                                    try {
                                        // 1. Initialize Cricket Data Layer
                                        await CricketDataLayer.initialize();

                                        // 2. Create match with booking data
                                        const match = await CricketDataLayer.createMatch({
                                            teamAId: booking.userName || 'Team A',
                                            teamBId: 'Team B',
                                            totalOvers: 20,
                                            venue: {
                                                name: booking.venueName,
                                            },
                                        });

                                        // 3. Start match
                                        await CricketDataLayer.startMatch(match.id);

                                        // 4. Initialize Live Scoring Engine
                                        const { LiveScoringEngine } = await import('@/lib/scoring');
                                        const scoringEngine = new LiveScoringEngine({
                                            matchId: match.id,
                                            teamAId: booking.userName || 'Team A',
                                            teamBId: 'Team B',
                                        });
                                        await scoringEngine.startMatch(
                                            booking.userName || 'Team A',
                                            'Team B',
                                            20
                                        );

                                        // 5. Open TV broadcast in new window
                                        window.open('/broadcast', '_blank', 'width=1920,height=1080');

                                        // 6. Navigate to Match Mode (activates camera + AI)
                                        navigate(`/match/${booking.id}`);

                                        toast.success('Match started! Camera and AI systems activating...');
                                    } catch (error) {
                                        console.error('Failed to start match:', error);
                                        toast.error('Failed to start match. Please try again.');
                                    }
                                }}
                            >
                                <Play className="w-4 h-4 mr-2 fill-white" />
                                Start Match
                            </Button>
                            <Button className="flex-1 sm:flex-none" onClick={handleDownloadPDF}>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default Invoice;
