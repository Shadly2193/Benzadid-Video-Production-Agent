"""Audio mix for project 003 v2: voice + ending clip + music bed + SFX bus, mixed as one piece.
- music: ducks under the voice (sidechain), dips 3 dB at 3 kHz so speech sits on top, falls away for the ending line
- SFX: one bus, high/low-passed and given a shared small-room reverb so every effect lives in the same space
- ending clip: its own voice lifted to the voiceover's loudness
"""
import json, subprocess
P = json.load(open("reel/src/p3plan_v2.json", encoding="utf-8"))
total = P["total"]; endS = [s for s in P["scenes"] if s["id"] == "ending"][0]["s"]
R = "reel/public/"
ins = ["-i", R + "p3/vo.wav", "-ss", str(P["music"]["from"]), "-i", R + "p3/music.mp3", "-i", R + "p3/ending.mp4"]
fx = []
for i, s in enumerate(P["sfx"]):
    ins += ["-i", R + "sfx/" + s["n"] + ".mp3"]
    d = int(s["t"] * 1000)
    trim = f",atrim=0:{s['d']}" if s.get("d") else ""
    fx.append(f"[{i+3}:a]aresample=48000,aformat=channel_layouts=stereo{trim},volume={s['v']},adelay={d}|{d}[s{i}]")
n = len(P["sfx"])
g = ";".join(fx)
g += ";" + "".join(f"[s{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0:dropout_transition=0,highpass=f=150,lowpass=f=9000,aecho=0.85:0.6:28|47:0.22|0.14,volume=0.9[fxbus]"
# voice
g += ";[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=%.3f,asplit=2[vo][vokey]" % total
# ending clip voice, lifted and placed
e = int(endS * 1000)
g += f";[2:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-2,adelay={e}|{e},apad=whole_dur={total:.3f},asplit=2[endv][endk]"
g += ";[vokey][endk]amix=inputs=2:normalize=0[key]"
# music bed: level, gentle EQ pocket, duck under voice, lower during ending line, fade out
g += (f";[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{total:.3f},volume=0.62,equalizer=f=3000:t=q:w=1.2:g=-3,"
      f"volume='if(gte(t,{endS:.3f}),0.5,1)':eval=frame,afade=t=in:d=0.6,afade=t=out:st={total-1.0:.3f}:d=1.0[mus]")
g += ";[mus][key]sidechaincompress=threshold=0.035:ratio=4:attack=40:release=420:makeup=1[musd]"
g += ";[vo][endv][musd][fxbus]amix=inputs=4:normalize=0,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=9[out]"
open("work/p3/mix_graph.txt", "w").write(g)
cmd = ["ffmpeg", "-nostdin", "-v", "error", "-y"] + ins + ["-/filter_complex", "work/p3/mix_graph.txt", "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", "work/p3/mix_v2.wav"]
subprocess.run(cmd, check=True)
print("mixed", n, "sfx")
