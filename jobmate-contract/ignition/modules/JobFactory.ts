import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const JobFactoryModule = buildModule("JobFactoryModule", (m) => {
  // Platform fee: 5%
  const platformFeePercent = m.getParameter("platformFeePercent", 5n);
  
  // Arbitrator address - should be set to platform owner or governance address
  const arbitrator = m.getParameter("arbitrator", m.getAccount(0));

  const jobFactory = m.contract("JobFactory", [arbitrator, platformFeePercent]);

  return { jobFactory };
});

export default JobFactoryModule;
