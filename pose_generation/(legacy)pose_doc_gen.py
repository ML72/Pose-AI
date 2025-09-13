# Generate a poses.txt file with >150 plausible, distinct body posture descriptions (SFW).
import random, textwrap, json, os, itertools

random.seed(42)

# Define categories with allowed components to keep combinations plausible.
categories = {
    "standing": {
        "stances": [
            "standing front-facing",
            "standing at a 45° turn",
            "standing side profile",
            "standing back-to-camera then half-turn look back",
            "standing contrapposto (S-curve)",
            "standing power pose"
        ],
        "arms": [
            "hands in pockets",
            "arms crossed",
            "one hand on hip",
            "both hands on hips",
            "one hand touching hair",
            "hands clasped in front",
            "one hand adjusting collar",
            "one hand adjusting glasses",
            "hand on chin (thinking)",
            "peace sign near face"
        ],
        "legs": [
            "feet together",
            "weight on one leg",
            "one foot forward",
            "crossed ankles",
            "wide stance",
            "on tiptoes"
        ],
        "heads": [
            "looking at camera",
            "looking left",
            "looking right",
            "looking down",
            "looking up",
            "over-shoulder glance",
            "chin up, confident",
            "head tilted slightly left",
            "head tilted slightly right",
            "eyes closed, soft smile"
        ]
    },
    "leaning": {
        "stances": [
            "leaning against a wall with shoulder",
            "leaning against a wall with back",
            "leaning on a railing",
            "leaning on a doorway frame",
            "leaning forward over a table edge"
        ],
        "arms": [
            "one hand in pocket",
            "arms crossed",
            "one hand on hip",
            "hands behind back",
            "one hand touching hair",
            "hands clasped loosely"
        ],
        "legs": [
            "one foot crossed over the other",
            "weight on back leg",
            "one knee bent",
            "feet shoulder-width apart"
        ],
        "heads": [
            "looking at camera",
            "looking away to the left",
            "looking away to the right",
            "over-shoulder glance",
            "chin down, soft smile"
        ]
    },
    "walking_running": {
        "stances": [
            "walking mid-step",
            "slow jog mid-stride",
            "casual stroll hands relaxed",
            "walking while turning head back",
            "walking crossing one foot in front of the other"
        ],
        "arms": [
            "arms relaxed swinging",
            "one hand in pocket, other swinging",
            "holding a bag in one hand",
            "one hand brushing hair back"
        ],
        "legs": [
            "one foot forward heel down",
            "one foot forward on toes",
            "long stride",
            "short quick step"
        ],
        "heads": [
            "looking at camera",
            "looking to the side",
            "looking back over shoulder",
            "eyes ahead, candid look"
        ]
    },
    "sitting_chair": {
        "stances": [
            "sitting on a chair facing forward",
            "sitting on a chair angled 45°",
            "sitting on a chair side-saddle",
            "sitting on a stool upright",
            "perched on stool edge"
        ],
        "arms": [
            "hands on lap",
            "one elbow on knee, chin in hand",
            "one hand on hip",
            "hands clasped loosely",
            "both hands behind head (relaxed)",
            "one hand holding a book on lap"
        ],
        "legs": [
            "ankles crossed",
            "one leg crossed over the other (figure-4)",
            "both feet flat on floor",
            "one knee slightly forward",
            "legs tucked back under chair"
        ],
        "heads": [
            "looking at camera",
            "head tilted left",
            "head tilted right",
            "looking down thoughtfully",
            "looking up slightly"
        ]
    },
    "sitting_floor": {
        "stances": [
            "sitting cross-legged on the floor",
            "sitting with legs stretched forward",
            "sitting with knees up, arms around shins",
            "sitting with legs to one side",
            "semi-recline supported by arms behind"
        ],
        "arms": [
            "hands resting on knees",
            "arms wrapped around legs",
            "one hand on floor for support",
            "both hands behind for support",
            "one hand on chin (thinking)"
        ],
        "legs": [
            "cross-legged",
            "knees up close to chest",
            "one leg stretched, one bent",
            "legs to the side",
            "ankles crossed forward"
        ],
        "heads": [
            "looking at camera",
            "looking down softly",
            "looking to the side",
            "eyes closed, relaxed smile"
        ]
    },
    "stairs_ledges": {
        "stances": [
            "sitting on stairs facing up",
            "sitting on stairs facing down",
            "perched on a ledge",
            "standing one foot on a step, one lower"
        ],
        "arms": [
            "hands on knees",
            "one elbow on knee, chin in hand",
            "hands clasped",
            "one hand on railing"
        ],
        "legs": [
            "knees together, ankles crossed",
            "one leg higher on the step",
            "one knee up, one down",
            "feet side-by-side"
        ],
        "heads": [
            "looking at camera",
            "looking down the stairs",
            "looking up the stairs",
            "over-shoulder glance"
        ]
    },
    "kneeling_squat": {
        "stances": [
            "kneeling on one knee (proposal pose)",
            "kneeling on both knees upright",
            "half-kneel with back straight",
            "low squat balanced on toes",
            "athletic squat, elbows on knees"
        ],
        "arms": [
            "hands on front knee",
            "hands clasped together",
            "one hand on hip",
            "one hand touching hair"
        ],
        "legs": [
            "one knee down, one knee up",
            "both knees down",
            "heels lifted, on toes",
            "knees apart, balanced"
        ],
        "heads": [
            "looking at camera",
            "looking down",
            "looking to the side"
        ]
    },
    "dynamic_jump_dance": {
        "stances": [
            "mid-jump star pose",
            "mid-jump knees-up tuck",
            "twirl with skirt/dress swish",
            "spin with hair flip",
            "side step dance pose",
            "one-leg balance with free leg kicked back"
        ],
        "arms": [
            "arms wide open",
            "one arm up, one out to side",
            "both arms up in a V",
            "arms extended sideways"
        ],
        "legs": [
            "both legs extended",
            "knees bent mid-air",
            "one leg kicked back",
            "one leg forward, one back"
        ],
        "heads": [
            "looking at camera",
            "looking up joyfully",
            "looking to the side"
        ]
    },
    "yoga_ballet": {
        "stances": [
            "yoga tree pose",
            "yoga warrior II",
            "yoga warrior I",
            "yoga triangle pose",
            "yoga chair pose",
            "ballet arabesque",
            "ballet first position",
            "ballet fourth position",
            "ballet fifth position arms overhead"
        ],
        "arms": [
            "hands in prayer at chest",
            "arms extended sideways",
            "arms overhead",
            "one arm forward, one back"
        ],
        "legs": [
            "one foot on inner calf (tree)",
            "wide lunge stance",
            "feet in turned-out ballet position",
            "front knee bent, back leg straight"
        ],
        "heads": [
            "gaze forward",
            "gaze over front hand",
            "chin slightly down, focused"
        ]
    },
    "lying_recline": {
        "stances": [
            "lying on side propped on elbow",
            "lying on stomach, chin in hands",
            "lying on back, one knee up",
            "lying on back, both knees up",
            "reclining on elbow, legs crossed at ankles"
        ],
        "arms": [
            "one hand under head",
            "chin in both hands",
            "hands resting on abdomen",
            "one hand on chest, other by side"
        ],
        "legs": [
            "legs extended straight",
            "one knee bent",
            "both knees bent",
            "ankles crossed"
        ],
        "heads": [
            "looking at camera",
            "looking to the side",
            "looking up"
        ]
    }
}

def make_sentence(stance, legs, arms, head):
    return f"{stance}, {legs}, {arms}, {head}."

all_lines = set()

# Generate combinations per category with controlled sampling to exceed 150 lines
target = 180
for cat, parts in categories.items():
    combos = list(itertools.product(parts["stances"], parts["legs"], parts["arms"], parts["heads"]))
    random.shuffle(combos)
    take = min(len(combos), 30 if cat not in ("standing","yoga_ballet","dynamic_jump_dance") else 40)
    for (s,l,a,h) in combos[:take]:
        all_lines.add(make_sentence(s, l, a, h))

# If still short, add some hand-gesture specific standing poses
extra_standing = [
    "standing 45° turn, weight on one leg, hands forming a heart above head, looking at camera.",
    "standing front-facing, feet together, finger heart with both hands near chest, head tilted left.",
    "standing side profile, one foot forward, finger on lips (shh), looking to the side.",
    "standing contrapposto (S-curve), crossed ankles, peace sign near face, eyes closed, soft smile.",
    "standing back-to-camera then half-turn look back, on tiptoes, one hand on hat brim, over-shoulder glance."
]
for l in extra_standing:
    all_lines.add(l)

lines = sorted(list(all_lines))
lines = lines[:max(160, len(lines))]  # cap to ~160+

# Ensure clean ASCII-ish punctuation for compatibility with generators, keep degree sign
def normalize(s):
    return s.replace("-","-").replace("–","-").strip()

lines = [normalize(s) for s in lines]

pose_path = "./pose_generation/poses.txt"
with open(pose_path, "w", encoding="utf-8") as f:
    for line in lines:
        f.write(line + "\n")
print(f"Wrote {len(lines)} poses to {pose_path}")
