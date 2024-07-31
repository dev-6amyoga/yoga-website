import { Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Form, FormFieldWrapper } from "../../components/ui/form";
import { toast } from "react-toastify";
import { Button, Container, TextField, Typography } from "@mui/material";
import { Fetch } from "../../utils/Fetch";

function Box({ children, className }) {
  return <div className={`p-4 border ${className}`}>{children}</div>;
}

export default function DesignBoard() {
  const form = useForm();
  const otpForm = useForm();
  const [formData, setFormData] = useState({});
  const [otpFormData, setOtpFormData] = useState({});
  const [num, setNum] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    toast("in");
    toast(num);
    try {
      const response = await Fetch({
        url: "/content/getFactorial",
        method: "POST",
        data: {
          number: num,
        },
      });
      if (response.status === 200) {
        toast("yay");
      } else {
        toast("nay1");
      }
    } catch (err) {
      toast("nay2");
    }
  };

  const onSubmit = (data) => {
    setFormData(data);
    console.log("SUBMITTED : ", data);
  };

  const onOtpSubmit = (data) => {
    setOtpFormData(data);
    console.log("OTP SUBMITTED : ", data);
  };

  const onReset = (e) => {
    e.preventDefault();
    try {
      form.reset();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-4 my-20">
      <div className="flex flex-col xl:grid xl:grid-cols-3">
        <Container>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 4,
            }}
          >
            <Typography variant="h4" gutterBottom>
              Factorial Calculator
            </Typography>
            <TextField
              label="Enter a number"
              variant="outlined"
              type="number"
              value={num}
              onChange={(e) => setNum(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCalculate}
            >
              Calculate
            </Button>
            {result !== null && (
              <Typography variant="h6" sx={{ mt: 2 }}>
                Factorial: {result}
              </Typography>
            )}
            {error && (
              <Typography variant="h6" color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Container>
      </div>
    </div>
  );
}
