//Name maps for human readable names
const actionMap = {
    "kMove": "Moving",
    "kScan": "Scanning for nearby resources",
    "kMine": "Mining resources",
    "kTransfer": "Transferring cargo",
    "kBuildBot": "Building new mining bot",
    "kExplode": "Exploding",
    "kNumberOfActions": "Enumerating actions"
}
const statusMap = {
    "kNotStarted": "Not Started",
    "kBlocked": "Interrupted",
    "kInProgress": "Running",
    "kReachedInterval": "Resting",
    "kCompleted": "Complete",
    "kCancelledInsufficientEnergy": "Failed -- Insufficient energy",
    "kCancelledPathBlocked": "Failed -- Destination position unreachable",
    "kCancelledBotMovedTooFar": "Failed -- Bot too far from target",
    "kCancelled": "Cancelled"
}
const variantMap = {
    "kMiningBot": "Mining Bot",
    "kFactoryBot": "Factory Bot"
}
const gameStatusMap = {
    "kNotStarted": "Not Started",
    "kOpen": "Running",
    "kFull": "Running (Full)",
    "kEnded": "Finished",
    undefined: "Unknown"
}