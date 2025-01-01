import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Divider,
  Container,
} from "@mui/material";
import PageWrapper from "../../components/Common/PageWrapper";

function PlansAndPricing() {
  return (
    <PageWrapper heading="Plans and Pricing">
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Divider />

          <Card variant="outlined" sx={{ width: "100%" }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Plans and Pricing
              </Typography>
              <Typography variant="body1" paragraph>
                We currently have two plans for students
              </Typography>

              <Card sx={{ mb: 2, p: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    Solo Plan 1 Month
                  </Typography>
                  <Typography variant="body2">Validity for 30 Days</Typography>
                  <Typography variant="body2">50 Hours Watch Time</Typography>
                  <Typography variant="body2">
                    Monthly yoga sequence having warm up, suryanamaskara,
                    yogasanas and pranayama (75 min/day)
                  </Typography>
                  <Typography variant="h6" color="primary" component="div">
                    INR 2999 / $72 / 72 EUR
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ mb: 2, p: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    Family Plan 1 Month
                  </Typography>
                  <Typography variant="body2">Validity for 30 Days</Typography>
                  <Typography variant="body2">100 Hours Watch Time</Typography>
                  <Typography variant="body2">
                    Monthly yoga sequence having warm up, suryanamaskara,
                    yogasanas and pranayama (75 min/day)
                  </Typography>
                  <Typography variant="h6" color="primary" component="div">
                    INR 3999 / $96 / 96 EUR
                  </Typography>
                </CardContent>
              </Card>
            </CardContent>

            <CardActions>
              <Typography variant="body2" color="text.secondary">
                For any queries contact us at +91990802351 or write us at
                992351@gmail.com
              </Typography>
            </CardActions>
          </Card>
        </Box>
      </Container>
    </PageWrapper>
  );
}

export default PlansAndPricing;
