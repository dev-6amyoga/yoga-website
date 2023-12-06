import { Button, Input, Card, Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Common/AdminNavbar/AdminNavbar";
import "./RegisterVideoForm.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterLanguageForm() {
  const navigate = useNavigate();
  const notify = () => toast("Enter a valid language!");
  const [tableLanguages, setTableLanguages] = useState([]);
  const [found, setFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/language/getAllLanguages"
        );
        const data = await response.json();
        setTableLanguages(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const language = document.querySelector("#language").value;
    if (language == "") {
      console.log("Enter a language!");
      notify();
    } else {
      for (var lang in tableLanguages) {
        if (lang.language == language) {
          setFound(true);
          break;
        }
      }
      if (found) {
        console.log("Already exists!");
      } else {
        const newLanguage = {
          language: language,
        };
        console.log(newLanguage);
        try {
          const response = await fetch(
            "http://localhost:4000/content/language/addLanguage",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newLanguage),
            }
          );

          if (response.ok) {
            console.log("New Asana added successfully");
            navigate("/admin/allLanguages");
          } else {
            console.error("Failed to add new Asana");
          }
        } catch (error) {
          console.error("Error while making the request:", error);
        }
      }
    }
  };

  return (
    <div className="video_form min-h-screen">
      <AdminNavbar />
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen max-w-4xl mx-auto">
        <form
          className="flex flex-col gap-1 border-2 w-full p-4 rounded-md mx-auto bg-white"
          onSubmit={handleSubmit}
        >
          <Text h3>Register New Language</Text>
          <br />
          <Card shadow>
            <Text span style={{ color: "#949392" }}>
              Existing Languages:
            </Text>
            {tableLanguages &&
              tableLanguages.map((language) => (
                <Text style={{ color: "#949392" }}>{language.language}</Text>
              ))}
          </Card>
          <br />
          <Text h5>New Language:</Text>
          <Input width="100%" id="language"></Input>
          <br />
          <Button htmlType="submit">Submit</Button>
        </form>
      </div>
    </div>
  );
}
