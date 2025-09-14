import { Github, Linkedin, Mail, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { useUIStore } from "@/lib/store";

export default function ContactDialog() {
  const { contactOpen, setContactOpen } = useUIStore();
  return (
    <Dialog open={contactOpen} onOpenChange={setContactOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-black/50 border-cyan-400/30 text-white hover:bg-cyan-400/10 backdrop-blur-sm"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900/95 border-cyan-400/30 text-white max-h-[90vh] overflow-y-auto backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400">
            Get In Touch
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <p className="text-gray-300">
            I'm always interested in new opportunities and collaborations. Let's
            create something amazing together!
          </p>

          <div className="space-y-4">
            <Card className="bg-black/30 border-gray-700 hover:border-cyan-400/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center space-x-4 pt-6">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-gray-400">hallelojowuro@gmail.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-gray-700 hover:border-cyan-400/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center space-x-4 pt-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Github className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">GitHub</h4>
                  <p className="text-gray-400">github.com/hallel20</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-gray-700 hover:border-cyan-400/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center space-x-4 pt-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Linkedin className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold">LinkedIn</h4>
                  <p className="text-gray-400">linkedin.com/in/hallel-ojowuro-42748a211</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3">
              Start a Conversation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
