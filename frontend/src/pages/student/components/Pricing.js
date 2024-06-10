import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

export default function Pricing({ allPlans, subscribePlan, selectedCurrency }) {
	return (
		<div className="my-10 grid w-full grid-cols-1 place-content-center place-items-center gap-4 md:grid-cols-3 lg:gap-8">
			{allPlans?.map((plan) => {
				const selectedPricing = plan.pricing.find(
					(x) => x.currency.short_tag === selectedCurrency
				);
				return (
					<>
						<Card
							sx={{
								p: 2,
								display: "flex",
								flexDirection: "column",
								gap: 4,
								width: "100%",
								border:
									plan.plan_validity_days === 90
										? "1px solid"
										: undefined,
								borderColor:
									plan.plan_validity_days === 90
										? "primary.main"
										: undefined,
								background:
									plan.plan_validity_days === 90
										? "linear-gradient(#033363, #021F3B)"
										: undefined,
							}}>
							<CardContent>
								{/* name */}
								<Box
									sx={{
										mb: 1,
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										color:
											plan.plan_validity_days === 90
												? "grey.100"
												: "",
									}}>
									<Typography component="h3" variant="h6">
										{plan.name}
									</Typography>

									{plan.plan_validity_days === 90 && (
										<Chip
											icon={<AutoAwesomeIcon />}
											label={"Recommended"}
											size="small"
											sx={{
												background: (theme) =>
													theme.palette.mode ===
													"light"
														? ""
														: "none",
												backgroundColor:
													"primary.contrastText",
												"& .MuiChip-label": {
													color: "primary.dark",
												},
												"& .MuiChip-icon": {
													color: "primary.dark",
												},
											}}
										/>
									)}
								</Box>

								{/* pricing */}
								<Box
									sx={{
										display: "flex",
										alignItems: "baseline",
										color:
											plan.plan_validity_days === 90
												? "grey.50"
												: undefined,
									}}>
									<Typography component="h3" variant="h3">
										{selectedCurrency}{" "}
										{selectedPricing.denomination}
									</Typography>
									{/* <Typography component="h3" variant="h6">
											&nbsp; per month
										</Typography> */}
								</Box>

								<Divider
									sx={{
										my: 2,
										opacity: 0.2,
										borderColor: "grey.500",
									}}
								/>

								{[
									{
										name: `Validity for ${plan.plan_validity_days} Days`,
										enable: true,
									},
									{
										name: `${plan.watch_time_limit / 3600} Watch time hours`,
										enable: true,
									},
									{
										name: "Play 6AM Yoga playlists",
										enable: plan.has_basic_playlist,
									},
									{
										name: "Create custom curated playlists",
										enable: plan.has_playlist_creation,
									},
								].map((feature) => (
									<Box
										key={feature.name}
										sx={{
											py: 1,
											display: "flex",
											gap: 1.5,
											alignItems: "center",
										}}>
										{feature.enable ? (
											<>
												<CheckCircleRoundedIcon
													sx={{
														width: 20,
														color:
															plan.plan_validity_days ===
															90
																? "primary.light"
																: "primary.main",
													}}
												/>
												<Typography
													component="text"
													variant="subtitle2"
													sx={{
														color:
															plan.plan_validity_days ===
															90
																? "grey.200"
																: undefined,
													}}>
													{feature.name}
												</Typography>
											</>
										) : (
											<></>
										)}
									</Box>
								))}
							</CardContent>

							<CardActions>
								<Button
									fullWidth
									variant={
										plan.plan_validity_days === 90
											? "contained"
											: "outlined"
									}
									onClick={() => subscribePlan(plan)}>
									Purchase
								</Button>
							</CardActions>
						</Card>
					</>
				);
			})}
		</div>
	);
}
